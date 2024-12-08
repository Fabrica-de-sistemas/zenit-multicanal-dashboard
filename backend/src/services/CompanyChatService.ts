// backend/src/services/CompanyChatService.ts
import { EventEmitter } from 'events';
import { MessageReaction } from '../types/chatTypes';

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

interface ChatMessage {
    id: string;
    content: string;
    userId: string;
    userName: string;
    userRole: string;
    timestamp: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    reactions: MessageReaction[];
    toUserId?: string;
}

class CompanyChatService extends EventEmitter {
    private static instance: CompanyChatService;
    private messages: ChatMessage[] = [];
    private onlineUsers: Map<string, OnlineUser> = new Map();
    private userSockets: Map<string, string> = new Map(); // userId -> socketId

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

        // Remove reação existente do usuário com o mesmo emoji
        const existingReactionIndex = message.reactions.findIndex(
            reaction => reaction.userId === userId && reaction.emoji === emoji
        );

        if (existingReactionIndex !== -1) {
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            // Adiciona nova reação
            message.reactions.push({
                emoji,
                userId,
                userName
            });
        }

        return message;
    }

    public async addPrivateMessage(messageData: Omit<ChatMessage, 'id' | 'reactions'>): Promise<ChatMessage> {
        const newMessage: ChatMessage = {
            ...messageData,
            id: Date.now().toString(),
            reactions: []
        };

        this.messages.push(newMessage);
        return newMessage;
    }

    public getMessages(): ChatMessage[] {
        return this.messages.filter(msg => !msg.toUserId);
    }

    public startPrivateChat(fromUserId: string, toUserId: string): {
        fromUserId: string;
        toUserId: string;
        messages: ChatMessage[];
    } {
        const messages = this.getPrivateMessages(fromUserId, toUserId);
        return {
            fromUserId,
            toUserId,
            messages
        };
    }

    public getPrivateMessages(fromUserId: string, toUserId: string): ChatMessage[] {
        return this.messages.filter(message =>
            message.toUserId && (
                (message.userId === fromUserId && message.toUserId === toUserId) ||
                (message.userId === toUserId && message.toUserId === fromUserId)
            )
        );
    }

    public addOnlineUser(user: OnlineUser): void {
        const existingUser = this.onlineUsers.get(user.id);
        if (existingUser) {
            // Mantém o status existente se não for fornecido um novo
            this.onlineUsers.set(user.id, {
                ...user,
                status: user.status || existingUser.status
            });
        } else {
            this.onlineUsers.set(user.id, user);
        }
        if (user.socketId) {
            this.userSockets.set(user.id, user.socketId);
        }
    }

    public removeOnlineUser(socketId: string): void {
        const userId = Array.from(this.onlineUsers.values())
            .find(user => user.socketId === socketId)?.id;

        if (userId) {
            this.onlineUsers.delete(userId);
            this.userSockets.delete(userId);
        }
    }

    public updateUserStatus(userId: string, status: 'available' | 'away' | 'meeting'): OnlineUser | null {
        const user = this.onlineUsers.get(userId);
        if (user) {
            const updatedUser = { ...user, status };
            this.onlineUsers.set(userId, updatedUser);
            return updatedUser;
        }
        return null;
    }

    public getOnlineUsers(): OnlineUser[] {
        return Array.from(this.onlineUsers.values());
    }

    public getSocketIdByUserId(userId: string): string | undefined {
        const user = this.onlineUsers.get(userId);
        return user?.socketId;
    }
}

export default CompanyChatService;