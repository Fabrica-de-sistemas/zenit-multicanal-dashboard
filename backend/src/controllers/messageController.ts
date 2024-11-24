// backend/src/controllers/messageController.ts
import { Request, Response } from 'express';
import WhatsAppService from '../services/WhatsAppService';

export const messageController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { platform, recipientId, message } = req.body;
      
      const whatsappService = WhatsAppService.getInstance();
      const success = await whatsappService.sendMessage(recipientId, message);
      
      if (success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ error: 'Falha ao enviar mensagem' });
      }
    } catch (error) {
      console.error('Erro no envio:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};