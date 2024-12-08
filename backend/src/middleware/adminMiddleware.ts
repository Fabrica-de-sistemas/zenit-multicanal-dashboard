// backend/src/middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verifica se o usuário tem role ADMIN
    const userRole = req.user.role;
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};