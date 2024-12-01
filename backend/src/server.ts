// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import WhatsAppService from './services/WhatsAppService';
import CompanyChatService from './services/CompanyChatService';
import uploadRoutes from './routes/uploadRoutes';
import path from 'path';

const app = express();
const httpServer = createServer(app);

// Configuração do CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Criação do servidor Socket.IO
const socketServer = new SocketServer(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`\n${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') {
        console.log('Body:', {
            ...req.body,
            password: req.body.password ? '[PROTEGIDO]' : undefined
        });
    }
    next();
});

// Rotas
app.use('/uploads', express.static('uploads'));
app.use('/api', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Inicialização dos serviços
const whatsappService = WhatsAppService.getInstance();
const companyChatService = CompanyChatService.getInstance();

// Configuração do Socket.IO
socketServer.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Envio inicial de tickets do WhatsApp
    const tickets = whatsappService.getAllTickets();
    socket.emit('tickets', tickets);
    console.log('Tickets enviados para novo cliente:', tickets.length);

    // Eventos do Chat Interno
    socket.on('getChatHistory', () => {
        console.log('Solicitação de histórico do chat interno');
        const messages = companyChatService.getMessages();
        socket.emit('chatHistory', messages);
    });

    // Evento quando um usuário se conecta ao chat
    socket.on('userConnected', (userData) => {
        console.log('Usuário conectado ao chat:', userData);
        companyChatService.addOnlineUser({
            ...userData,
            socketId: socket.id,
            isOnline: true,
            lastSeen: new Date().toISOString()
        });
        // Emite a lista atualizada para todos
        socketServer.emit('onlineUsers', companyChatService.getOnlineUsers());
    });

    // Evento para atualização de status do usuário
    socket.on('updateStatus', ({ userId, status }) => {
        console.log('Atualizando status do usuário:', { userId, status });
        const updatedUser = companyChatService.updateUserStatus(userId, status);
        if (updatedUser) {
            socketServer.emit('onlineUsers', companyChatService.getOnlineUsers());
        }
    });

    // Eventos de Chat Privado
    socket.on('startPrivateChat', ({ fromUserId, toUserId }) => {
        console.log('Iniciando chat privado:', { fromUserId, toUserId });
        const chat = companyChatService.startPrivateChat(fromUserId, toUserId);
        socket.emit('privateChatStarted', chat);
    });

    socket.on('sendPrivateMessage', async (messageData) => {
        try {
            console.log('Nova mensagem privada:', {
                ...messageData,
                content: messageData.content.substring(0, 50) + '...'
            });

            if (!messageData.content || !messageData.userId || !messageData.toUserId) {
                throw new Error('Dados da mensagem privada inválidos');
            }

            const newMessage = await companyChatService.addPrivateMessage(messageData);

            // Emite para todos (incluindo o remetente e o destinatário)
            socketServer.emit('newPrivateMessage', newMessage);

            console.log('Mensagem privada enviada com sucesso');
        } catch (error) {
            console.error('Erro ao processar mensagem privada:', error);
            socket.emit('messageError', {
                error: 'Não foi possível enviar a mensagem privada'
            });
        }
    });

    socket.on('getPrivateChatHistory', ({ fromUserId, toUserId }) => {
        const messages = companyChatService.getPrivateMessages(fromUserId, toUserId);
        socket.emit('privateChatHistory', { messages });
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            console.log('Nova mensagem do chat interno:', messageData);

            if (!messageData.content || !messageData.userId) {
                throw new Error('Dados da mensagem inválidos');
            }

            const newMessage = await companyChatService.addMessage(messageData);
            socketServer.emit('newMessage', newMessage);
            console.log('Mensagem do chat interno enviada com sucesso');
        } catch (error) {
            console.error('Erro ao processar mensagem do chat interno:', error);
            socket.emit('messageError', {
                error: 'Não foi possível enviar a mensagem'
            });
        }
    });

    socket.on('addReaction', async ({ messageId, emoji, userId, userName }) => {
        const updatedMessage = await companyChatService.addReaction(
            messageId,
            userId,
            userName,
            emoji
        );

        if (updatedMessage) {
            socketServer.emit('messageReacted', updatedMessage);
        }
    });

    // Eventos do WhatsApp
    socket.on('resolveTicket', (ticketId: string) => {
        console.log('Solicitação para resolver ticket:', ticketId);
        const resolved = whatsappService.resolveTicket(ticketId);
        if (resolved) {
            console.log('Ticket resolvido com sucesso:', ticketId);
        }
    });

    socket.on('sendWhatsAppMessage', async ({ ticketId, message }) => {
        console.log('Recebendo mensagem WhatsApp para enviar:', { ticketId, message });
        try {
            const success = await whatsappService.sendMessage(ticketId, message);
            if (success) {
                console.log('Mensagem WhatsApp enviada com sucesso');
            } else {
                console.log('Falha ao enviar mensagem WhatsApp');
                socket.emit('messageError', {
                    error: 'Não foi possível enviar a mensagem'
                });
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem WhatsApp:', error);
            socket.emit('messageError', {
                error: 'Erro ao enviar mensagem'
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        // Remove usuário da lista de online
        companyChatService.removeOnlineUser(socket.id);
        // Emite lista atualizada para todos
        socketServer.emit('onlineUsers', companyChatService.getOnlineUsers());
    });
});

// Listener para updates de tickets do WhatsApp
whatsappService.on('ticketUpdated', (ticket) => {
    console.log('Emitindo atualização de ticket para todos os clientes:', ticket.id);
    socketServer.emit('ticketUpdated', ticket);
});

const PORT = process.env.PORT || 5000;

// Inicia o servidor
httpServer.listen(PORT, () => {
    console.log(`\nServidor rodando em http://localhost:${PORT}`);
    console.log('Socket.IO configurado e pronto para conexões');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('Erro não tratado:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Exceção não capturada:', error);
});