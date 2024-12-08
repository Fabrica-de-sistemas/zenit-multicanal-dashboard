// backend/src/controllers/chatController.ts

import { Request, Response } from 'express';
import ChatService from '../services/ChatService';

export const chatController = {
  async getHistory(req: Request, res: Response) {
    try {
      const history = await ChatService.getInstance().getHistory();
      return res.json(history);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};