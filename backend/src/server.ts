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
import adminRoutes from './routes/adminRoutes';
import ChatService from './services/ChatService';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const userConnections = new Map<string, string>(); // userId -> socketId
const chatService = ChatService.getInstance();

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
app.use('/api/admin', adminRoutes);

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
    socket.on('getChatHistory', async () => {
        try {
            console.log('Solicitação de histórico do chat interno');
            const messages = await chatService.getHistory(); // Usa o chatService em vez do companyChatService
            console.log('Enviando histórico:', messages.length, 'mensagens');
            socket.emit('chatHistory', messages);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            socket.emit('messageError', {
                error: 'Não foi possível carregar o histórico'
            });
        }
    });

    // Evento quando um usuário se conecta ao chat
    socket.on('userConnected', (userData) => {
        const existingSocketId = userConnections.get(userData.id);

        // Se já existe uma conexão para este usuário
        if (existingSocketId) {
            // Não emitir novo status se já está conectado
            return;
        }

        console.log('Usuário conectado ao chat:', userData);

        // Registra a nova conexão
        userConnections.set(userData.id, socket.id);

        // Adiciona o usuário mantendo o status existente
        const currentUser = companyChatService.getOnlineUsers()
            .find(u => u.id === userData.id);

        companyChatService.addOnlineUser({
            ...userData,
            socketId: socket.id,
            isOnline: true,
            lastSeen: new Date().toISOString(),
            status: currentUser?.status || userData.status || 'available'
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

    socket.on('getPrivateChatHistory', async ({ fromUserId, toUserId }) => {
        try {
            const messages = await companyChatService.getPrivateMessages(fromUserId, toUserId);
            socket.emit('privateChatHistory', { messages });
        } catch (error) {
            console.error('Erro ao buscar histórico privado:', error);
            socket.emit('messageError', {
                error: 'Não foi possível carregar o histórico'
            });
        }
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            console.log('Nova mensagem do chat interno:', messageData);

            if (!messageData.content || !messageData.userId) {
                throw new Error('Dados da mensagem inválidos');
            }

            // Usa o ChatService para mensagens internas
            const newMessage = await chatService.addMessage(messageData);
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
        console.log('Tentando adicionar reação:', { messageId, emoji, userId, userName });
        try {
            const updatedMessage = await chatService.addReaction(messageId, userId, userName, emoji);
            socketServer.emit('messageReacted', updatedMessage);
        } catch (error) {
            console.error('Erro ao adicionar reação:', error);
            socket.emit('messageError', {
                error: 'Não foi possível adicionar a reação'
            });
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

        // Remove a conexão do mapa
        for (const [userId, socketId] of userConnections.entries()) {
            if (socketId === socket.id) {
                userConnections.delete(userId);
                break;
            }
        }

        // Remove usuário da lista de online mas mantém o status
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