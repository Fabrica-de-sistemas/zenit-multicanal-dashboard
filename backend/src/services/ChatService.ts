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

interface ReactionResult extends RowDataPacket {
  emoji: string;
  users: string;
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
    try {
      const messages = await query<CompanyMessageDB>(chatQueries.getCompanyMessages);

      const messagesWithReactions = await Promise.all(
        messages.map(async (msg) => {
          const reactionResults = await query<ReactionResult>(
            `SELECT DISTINCT
                        mr.emoji,
                        (
                            SELECT GROUP_CONCAT(DISTINCT user_id)
                            FROM message_reactions
                            WHERE message_id = ? AND emoji = mr.emoji
                        ) as users
                    FROM message_reactions mr 
                    WHERE mr.message_id = ?`,
            [msg.id, msg.id]
          );

          const reactions = reactionResults || [];

          return {
            id: msg.id,
            userId: msg.user_id,
            content: msg.content,
            userName: msg.full_name,
            userRole: msg.role || 'Geral',
            timestamp: msg.created_at.toISOString(),
            reactions: reactions.map((r: ReactionResult) => ({
              emoji: r.emoji,
              users: (r.users || '').split(',').filter(Boolean)
            }))
          };
        })
      );

      return messagesWithReactions;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  async addMessage(message: CompanyMessage): Promise<CompanyMessage> {
    try {
      const messageId = uuidv4();

      await execute(chatQueries.saveCompanyMessage, [
        messageId,
        message.userId,
        message.userRole,
        message.content
      ]);

      console.log('Mensagem salva:', { messageId, ...message });

      const savedMessage = {
        ...message,
        id: messageId,
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



  async addReaction(messageId: string, userId: string, userName: string, emoji: string): Promise<CompanyMessage> {
    try {
      console.log('addReaction iniciado:', { messageId, userId, userName, emoji });

      const [existingReaction] = await query<MessageReactionDB>(
        'SELECT * FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
        [messageId, userId, emoji]
      );

      if (existingReaction) {
        console.log('Removendo reação existente');
        await execute(
          'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
          [messageId, userId, emoji]
        );
      } else {
        console.log('Adicionando nova reação');
        const reactionId = uuidv4();
        await execute(
          'INSERT INTO message_reactions (id, message_id, user_id, user_name, emoji) VALUES (?, ?, ?, ?, ?)',
          [reactionId, messageId, userId, userName, emoji]
        );
      }

      const [message] = await query<CompanyMessageDB>(
        'SELECT cm.*, u.full_name, u.role FROM company_messages cm JOIN users u ON cm.user_id = u.id WHERE cm.id = ?',
        [messageId]
      );

      if (!message) throw new Error('Mensagem não encontrada');

      const reactionResults = await query<ReactionResult>(
        `SELECT DISTINCT
            mr.emoji,
            (
                SELECT GROUP_CONCAT(DISTINCT user_id)
                FROM message_reactions
                WHERE message_id = ? AND emoji = mr.emoji
            ) as users
        FROM message_reactions mr 
        WHERE mr.message_id = ?`,
        [messageId, messageId]
      );

      const reactions = reactionResults || [];

      const updatedMessage = {
        id: message.id,
        userId: message.user_id,
        content: message.content,
        userName: message.full_name,
        userRole: message.role || 'Geral',
        timestamp: message.created_at.toISOString(),
        reactions: reactions.map((r: ReactionResult) => ({
          emoji: r.emoji,
          users: (r.users || '').split(',').filter(Boolean)
        }))
      };

      this.emit('messageReacted', updatedMessage);
      return updatedMessage;
    } catch (error) {
      console.error('Erro detalhado ao processar reação:', error);
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
      userRole: message.role || 'Geral',
      timestamp: message.created_at.toISOString(),
      reactions: this.groupReactions(reactions)
    };
  }

  private groupReactions(reactions: any[]): { emoji: string; users: string[]; }[] {
    if (!Array.isArray(reactions)) {
      reactions = [reactions].filter(Boolean);
    }

    const groupedReactions = new Map<string, string[]>();

    reactions.forEach(reaction => {
      if (reaction && reaction.emoji) {
        if (!groupedReactions.has(reaction.emoji)) {
          groupedReactions.set(reaction.emoji, []);
        }
        groupedReactions.get(reaction.emoji)?.push(reaction.user_id);
      }
    });

    return Array.from(groupedReactions.entries()).map(([emoji, users]) => ({
      emoji,
      users
    }));
  }
}

export default ChatService;