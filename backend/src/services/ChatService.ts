// services/ChatService.ts
import { EventEmitter } from 'events';
import { CompanyMessage } from '../types/chatTypes';
import { chatQueries } from '../database/queries/chatQueries';
import { RowDataPacket, execute, query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface CompanyMessageDB extends RowDataPacket {
  id: string;
  user_id: string;
  content: string;
  full_name: string;
  role: string;
  sector: string;
  created_at: Date;
}

interface MessageReactionDB extends RowDataPacket {
  message_id: string;
  user_id: string;
  emoji: string;
}

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
    const messages = await query<CompanyMessageDB>(chatQueries.getCompanyMessages);
    return messages.map(msg => ({
        id: msg.id,
        userId: msg.user_id,
        content: msg.content,
        userName: msg.full_name,
        userRole: msg.role || 'Geral',
        timestamp: msg.created_at.toISOString(),
        reactions: []
    }));
}

  async addMessage(message: CompanyMessage): Promise<CompanyMessage> {
    try {
      // Gera ID único para a mensagem
      const messageId = uuidv4();

      // Insere a mensagem no banco
      await execute(chatQueries.saveCompanyMessage, [
        messageId,
        message.userId,
        message.userRole,
        message.content
      ]);

      console.log('Mensagem salva:', { messageId, ...message });

      // Cria o objeto savedMessage corretamente
      const savedMessage = {
        ...message,         // Spread primeiro
        id: messageId,      // Depois sobrescreve com os novos valores
        timestamp: new Date().toISOString(),
        reactions: []
      };

      this.emit('newMessage', savedMessage);

      return savedMessage;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      throw error;
    }
  }

  private async getMessageWithReactions(messageId: string): Promise<CompanyMessage | null> {
    const [message] = await query<CompanyMessageDB>(
        'SELECT * FROM company_messages WHERE id = ?',
        [messageId]
    );

    if (!message) return null;

    const reactions = await query<MessageReactionDB>(
        'SELECT * FROM message_reactions WHERE message_id = ?',
        [messageId]
    );

    return {
        id: message.id,
        userId: message.user_id,
        content: message.content,
        userName: message.full_name,
        userRole: message.role || 'Geral',  // Adicionando o userRole
        timestamp: message.created_at.toISOString(),
        reactions: this.groupReactions(reactions)
    };
}

  private groupReactions(reactions: MessageReactionDB[]): { emoji: string; users: string[]; }[] {
    const groupedReactions = new Map<string, string[]>();

    reactions.forEach(reaction => {
      if (!groupedReactions.has(reaction.emoji)) {
        groupedReactions.set(reaction.emoji, []);
      }
      groupedReactions.get(reaction.emoji)?.push(reaction.user_id);
    });

    return Array.from(groupedReactions.entries()).map(([emoji, users]) => ({
      emoji,
      users
    }));
  }
}

export default ChatService;