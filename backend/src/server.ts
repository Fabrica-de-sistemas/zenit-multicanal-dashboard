// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import WhatsAppService from './services/WhatsAppService';

const app = express();
const httpServer = createServer(app);

// Configuração do CORS antes de tudo
app.use(cors({
    origin: 'http://localhost:3000', // URL do seu frontend
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
    allowEIO3: true, // Permite Engine.IO versão 3
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
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Configuração do WhatsApp
const whatsappService = WhatsAppService.getInstance();

// Configuração do Socket.IO
socketServer.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Envia todos os tickets quando um cliente se conecta
    const tickets = whatsappService.getAllTickets();
    socket.emit('tickets', tickets);
    console.log('Tickets enviados para novo cliente:', tickets.length);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });

    // Handle para resolver ticket
    socket.on('resolveTicket', (ticketId: string) => {
        console.log('Solicitação para resolver ticket:', ticketId);
        const resolved = whatsappService.resolveTicket(ticketId);
        if (resolved) {
            console.log('Ticket resolvido com sucesso:', ticketId);
        }
    });

    // Handle para enviar mensagem
    socket.on('sendMessage', async ({ ticketId, message }) => {
        console.log('Recebendo mensagem para enviar:', { ticketId, message });
        try {
            const success = await whatsappService.sendMessage(ticketId, message);
            if (success) {
                console.log('Mensagem enviada com sucesso');
            } else {
                console.log('Falha ao enviar mensagem');
                socket.emit('messageError', { 
                    error: 'Não foi possível enviar a mensagem' 
                });
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            socket.emit('messageError', { 
                error: 'Erro ao enviar mensagem' 
            });
        }
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