// backend/src/middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Admin Middleware - User:', req.user);
    
    if (!req.user) {
      console.log('Admin Middleware - Usuário não autenticado');
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Temporariamente permitindo acesso para teste
    console.log('Admin Middleware - Permitindo acesso para teste');
    next();

  } catch (error) {
    console.error('Erro no middleware admin:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};