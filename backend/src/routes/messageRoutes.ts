// backend/src/routes/messageRoutes.ts
import { Router } from 'express';
import { messageController } from '../controllers/messageController';

const router = Router();

// Correção: Use a função como callback
router.post('/send', async (req, res) => {
  await messageController.sendMessage(req, res);
});

export default router;