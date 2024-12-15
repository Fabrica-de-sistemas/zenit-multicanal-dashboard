// services/CompanyChatService.ts
import { EventEmitter } from 'events';
import { MessageReaction, ChatMessage } from '../types/chatTypes';
import { chatQueries } from '../database/queries/chatQueries';
import { execute, query, RowDataPacket } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface PrivateMessageDB extends RowDataPacket {
    id: string;
    from_user_id: string;
    to_user_id: string;
    content: string;
    created_at: Date;
    sender_name: string;
    role: string;
}

interface OnlineUser {
    id: string;
    name: string;
    role: string;
    sector: string;
    status: 'available' | 'away' | 'meeting';
    isOnline: boolean;
    lastSeen: string;
    socketId?: string;
}

class CompanyChatService extends EventEmitter {
    private static instance: CompanyChatService;
    private messages: ChatMessage[] = [];
    private onlineUsers: Map<string, OnlineUser> = new Map();
    private userSockets: Map<string, string> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): CompanyChatService {
        if (!CompanyChatService.instance) {
            CompanyChatService.instance = new CompanyChatService();
        }
        return CompanyChatService.instance;
    }

    public async addMessage(messageData: Omit<ChatMessage, 'id' | 'reactions'>): Promise<ChatMessage> {
        const newMessage: ChatMessage = {
            ...messageData,
            id: Date.now().toString(),
            reactions: []
        };

        this.messages.push(newMessage);
        return newMessage;
    }

    public async addReaction(messageId: string, userId: string, userName: string, emoji: string): Promise<ChatMessage | null> {
        const message = this.messages.find(m => m.id === messageId);

        if (!message) return null;

        if (!Array.isArray(message.reactions)) {
            message.reactions = [];
        }

        const existingReactionIndex = message.reactions.findIndex(
            reaction => reaction.userId === userId && reaction.emoji === emoji
        );

        if (existingReactionIndex !== -1) {
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            message.reactions.push({
                emoji,
                userId,
                userName
            });
        }

        return message;
    }

    async addPrivateMessage(messageData: { userId: string; toUserId: string; content: string; }): Promise<ChatMessage> {
        try {
            // Gera ID único
            const messageId = uuidv4();

            // Salva no banco
            await execute(chatQueries.savePrivateMessage, [
                messageId,
                messageData.userId,
                messageData.toUserId,
                messageData.content
            ]);

            console.log('Mensagem privada salva:', {
                id: messageId,
                from: messageData.userId,
                to: messageData.toUserId,
                content: messageData.content
            });

            // Busca a mensagem com os dados do usuário
            const [savedMessage] = await query<PrivateMessageDB>(
                `SELECT pm.*, u.full_name as sender_name, u.role 
                 FROM private_messages pm 
                 JOIN users u ON pm.from_user_id = u.id 
                 WHERE pm.id = ?`,
                [messageId]
            );

            if (!savedMessage) {
                throw new Error('Falha ao recuperar mensagem salva');
            }

            return {
                id: savedMessage.id,
                content: savedMessage.content,
                userId: savedMessage.from_user_id,
                userName: savedMessage.sender_name,
                userRole: savedMessage.role,
                timestamp: savedMessage.created_at.toISOString(),
                reactions: []
            };
        } catch (error) {
            console.error('Erro ao salvar mensagem privada:', error);
            throw error;
        }
    }


    public getMessages(): ChatMessage[] {
        return this.messages;
    }

    public async startPrivateChat(fromUserId: string, toUserId: string): Promise<{
        fromUserId: string;
        toUserId: string;
        messages: ChatMessage[];
    }> {
        const messages = await this.getPrivateMessages(fromUserId, toUserId);
        return {
            fromUserId,
            toUserId,
            messages: await messages
        };
    }

    async getPrivateMessages(fromUserId: string, toUserId: string): Promise<ChatMessage[]> {
        const messages = await query<PrivateMessageDB>(chatQueries.getPrivateMessages, [
            fromUserId, toUserId, toUserId, fromUserId
        ]);

        return messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            userId: msg.from_user_id,
            userName: msg.sender_name,
            userRole: msg.role,
            timestamp: msg.created_at.toISOString(),
            reactions: []
        }));
    }

    // Restante dos métodos permanece igual
    public addOnlineUser(user: OnlineUser): void {
        const existingUser = this.onlineUsers.get(user.id);
        if (existingUser) {
            this.onlineUsers.set(user.id, {
                ...user,
                status: user.status || existingUser.status || 'available'
            });
        } else {
            this.onlineUsers.set(user.id, {
                ...user,
                status: user.status || 'available'
            });
        }
        if (user.socketId) {
            this.userSockets.set(user.id, user.socketId);
        }
    }

    public removeOnlineUser(socketId: string): void {
        const userId = Array.from(this.userSockets.entries())
            .find(([_, id]) => id === socketId)?.[0];

        if (userId) {
            const user = this.onlineUsers.get(userId);
            if (user) {
                this.onlineUsers.set(userId, {
                    ...user,
                    socketId: undefined
                });
            }
            this.userSockets.delete(userId);
        }
    }

    public updateUserStatus(userId: string, status: 'available' | 'away' | 'meeting'): OnlineUser | null {
        const user = this.onlineUsers.get(userId);
        if (user) {
            const updatedUser = {
                ...user,
                status
            };
            this.onlineUsers.set(userId, updatedUser);
            return updatedUser;
        }
        return null;
    }

    public getOnlineUsers(): OnlineUser[] {
        return Array.from(this.onlineUsers.values()).map(user => ({
            ...user,
            status: user.status || 'available'
        }));
    }

    public getSocketIdByUserId(userId: string): string | undefined {
        const user = this.onlineUsers.get(userId);
        return user?.socketId;
    }
}

export default CompanyChatService;