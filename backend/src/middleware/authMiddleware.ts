// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
    sector?: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as { userId: string; email: string; role?: string; sector?: string }; // Adicionado role aqui

    // Garantir que todos os campos necessários sejam passados para req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sector: decoded.sector
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};