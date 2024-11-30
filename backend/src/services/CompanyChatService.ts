// backend/src/services/CompanyChatService.ts
import { EventEmitter } from 'events';

interface OnlineUser {
 id: string;
 name: string;
 role: string;
 sector: string;
 status: 'available' | 'away' | 'meeting';
 isOnline: boolean;
 lastSeen: string;
}

interface ChatMessage {
 id: string;
 content: string;
 userId: string;
 userName: string;
 userRole: string;
 userSector: string; // Adicionado setor do usuário na mensagem
 timestamp: string;
}

class CompanyChatService extends EventEmitter {
   private static instance: CompanyChatService;
   private messages: ChatMessage[] = [];
   private onlineUsers: Map<string, OnlineUser> = new Map();

   private constructor() {
     super();
   }

   public static getInstance(): CompanyChatService {
     if (!CompanyChatService.instance) {
       CompanyChatService.instance = new CompanyChatService();
     }
     return CompanyChatService.instance;
   }

   public async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
     const newMessage = {
       ...message,
       id: Date.now().toString(),
     };

     this.messages.push(newMessage);
     this.emit('newMessage', newMessage);
     return newMessage;
   }

   public getMessages(): ChatMessage[] {
     return this.messages;
   }

   public updateUserStatus(userId: string, status: OnlineUser['status']): OnlineUser | null {
     const user = this.onlineUsers.get(userId);
     if (user) {
       const updatedUser = { ...user, status };
       this.onlineUsers.set(userId, updatedUser);
       this.emit('userStatusUpdated', updatedUser);
       return updatedUser;
     }
     return null;
   }

   public updateUserSector(userId: string, sector: string): OnlineUser | null {
     const user = this.onlineUsers.get(userId);
     if (user) {
       const updatedUser = { ...user, sector };
       this.onlineUsers.set(userId, updatedUser);
       this.emit('userSectorUpdated', updatedUser);
       return updatedUser;
     }
     return null;
   }

   public getOnlineUsers(): OnlineUser[] {
     return Array.from(this.onlineUsers.values());
   }

   public getUsersBySector(): Record<string, OnlineUser[]> {
     const sectors: Record<string, OnlineUser[]> = {};
     this.onlineUsers.forEach(user => {
       if (!sectors[user.sector]) {
         sectors[user.sector] = [];
       }
       sectors[user.sector].push(user);
     });
     return sectors;
   }

   public addOnlineUser(user: OnlineUser): void {
     this.onlineUsers.set(user.id, user);
     this.emit('userConnected', user);
   }

   public removeOnlineUser(userId: string): void {
     const user = this.onlineUsers.get(userId);
     if (user) {
       this.onlineUsers.delete(userId);
       this.emit('userDisconnected', userId);
     }
   }

   public getUsersCount(): number {
     return this.onlineUsers.size;
   }

   public getUsersByStatus(status: OnlineUser['status']): OnlineUser[] {
     return Array.from(this.onlineUsers.values())
       .filter(user => user.status === status);
   }

   public getActiveUsers(): OnlineUser[] {
     return Array.from(this.onlineUsers.values())
       .filter(user => user.isOnline);
   }

   public getMessagesByUser(userId: string): ChatMessage[] {
     return this.messages.filter(message => message.userId === userId);
   }

   public getLatestMessages(limit: number = 50): ChatMessage[] {
     return this.messages.slice(-limit);
   }
}

export default CompanyChatService;