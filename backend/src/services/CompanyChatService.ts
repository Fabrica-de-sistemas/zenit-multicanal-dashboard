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
  socketId?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  type: 'public' | 'private';
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

  public async addMessage(messageData: Omit<ChatMessage, 'id' | 'type'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      type: 'public'
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  public async addPrivateMessage(messageData: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      type: 'private'
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  public getMessages(): ChatMessage[] {
    return this.messages.filter(msg => msg.type === 'public');
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
      message.type === 'private' &&
      ((message.userId === fromUserId && message.toUserId === toUserId) ||
        (message.userId === toUserId && message.toUserId === fromUserId))
    );
  }


  public addOnlineUser(user: OnlineUser): void {
    this.onlineUsers.set(user.id, user);
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