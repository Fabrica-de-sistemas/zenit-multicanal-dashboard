// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import WhatsAppService from './services/WhatsAppService';
import CompanyChatService from './services/CompanyChatService';
import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';
import ChatService from './services/ChatService';
import { permissionController } from './controllers/permissionController';
import PermissionService from './services/PermissionService';
import { Permission } from './config/permissions';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const userConnections = new Map<string, string>(); // userId -> socketId
const chatService = ChatService.getInstance();
const permissionService = PermissionService.getInstance();

// Configuração do CORS
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Criação do servidor Socket.IO
const io = new SocketServer(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});


// Disponibiliza o io para uso em outros arquivos
app.set('io', io);

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

// Middleware de autenticação para Socket.IO
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Token não fornecido'));
        }

        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        next();
    } catch (error) {
        console.error('Erro de autenticação:', error);
        next(new Error('Token inválido'));
    }
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Eventos de Permissões
    socket.on('requestPermissions', async (userId: string) => {
        try {
            const permissions = await permissionController.calculateEffectivePermissions(userId);
            socket.emit('permissionsUpdated', { userId, permissions });
        } catch (error) {
            console.error('Erro ao buscar permissões:', error);
        }
    });

    socket.on('requestUserPermissions', async (userId: string) => {
        const permissions = await permissionService.loadUserPermissions(userId);
        socket.emit('userPermissionsUpdated', { userId, permissions });
    });

    socket.on('updateUserPermissions', async ({ userId, permissions }) => {
        const success = await permissionService.updateUserPermissions(userId, permissions);
        if (success) {
            // O evento será emitido pelo serviço
        }
    });

    // Envio inicial de tickets do WhatsApp
    const tickets = whatsappService.getAllTickets();
    socket.emit('tickets', tickets);
    console.log('Tickets enviados para novo cliente:', tickets.length);

    // Eventos do Chat Interno
    socket.on('getChatHistory', async () => {
        try {
            console.log('Solicitação de histórico do chat interno');
            const messages = await chatService.getHistory();
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
        io.emit('onlineUsers', companyChatService.getOnlineUsers());
    });

    // Evento para atualização de status do usuário
    socket.on('updateStatus', ({ userId, status }) => {
        console.log('Atualizando status do usuário:', { userId, status });
        const updatedUser = companyChatService.updateUserStatus(userId, status);
        if (updatedUser) {
            io.emit('onlineUsers', companyChatService.getOnlineUsers());
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
            io.emit('newPrivateMessage', newMessage);

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

    socket.on('sendMessage', async (data) => {
        try {
            console.log('Recebendo mensagem do chat interno:', data);

            // Validação mais detalhada
            if (!data || typeof data !== 'object') {
                throw new Error('Dados da mensagem inválidos - formato incorreto');
            }

            if (!data.ticketId || !data.message) {
                throw new Error('Dados da mensagem inválidos - campos obrigatórios ausentes');
            }

            const success = await whatsappService.sendMessage(data.ticketId, data.message);

            if (success) {
                // Adiciona a mensagem ao ticket
                const ticket = whatsappService.addMessageToTicket(data.ticketId, {
                    id: uuidv4(),
                    content: data.message,
                    platform: 'whatsapp',
                    sender: {
                        name: 'Atendente',
                        username: 'operator',
                        isOperator: true
                    },
                    timestamp: new Date().toISOString()
                });

                // Emite atualização do ticket
                if (ticket) {
                    io.emit('ticketUpdated', ticket);
                }
            } else {
                socket.emit('messageError', {
                    error: 'Falha ao enviar mensagem'
                });
            }
        } catch (error) {
            console.error('Erro ao processar mensagem do chat interno:', error);
            socket.emit('messageError', {
                error: error instanceof Error ? error.message : 'Erro ao processar mensagem'
            });
        }
    });

    socket.on('addReaction', async ({ messageId, emoji, userId, userName }) => {
        console.log('Tentando adicionar reação:', { messageId, emoji, userId, userName });
        try {
            const updatedMessage = await chatService.addReaction(messageId, userId, userName, emoji);
            io.emit('messageReacted', updatedMessage);
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
        io.emit('onlineUsers', companyChatService.getOnlineUsers());
    });
});

// Listener para updates de tickets do WhatsApp
whatsappService.on('ticketUpdated', (ticket) => {
    console.log('Emitindo atualização de ticket para todos os clientes:', ticket.id);
    io.emit('ticketUpdated', ticket);
});

// Listener para atualizações de permissões
permissionService.on('permissionsUpdated', (data: { userId: string; permissions: Permission[] }) => {
    io.emit('userPermissionsUpdated', data);
});

const PORT = process.env.PORT || 8080;

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