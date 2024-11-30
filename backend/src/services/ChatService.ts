// backend/src/services/ChatService.ts

import { EventEmitter } from 'events';
import { CompanyMessage } from '../types/chatTypes';

class ChatService extends EventEmitter {
  private static instance: ChatService;
  private messages: CompanyMessage[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async getHistory(): Promise<CompanyMessage[]> {
    return this.messages;
  }

  async addMessage(message: CompanyMessage): Promise<CompanyMessage> {
    this.messages.push(message);
    this.emit('newMessage', message);
    return message;
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      if (!message.reactions) {
        message.reactions = [];
      }
      
      const existingReaction = message.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
          existingReaction.users.push(userId);
        }
      } else {
        message.reactions.push({
          emoji,
          users: [userId]
        });
      }

      this.emit('messageUpdated', message);
    }
  }
}

export default ChatService;