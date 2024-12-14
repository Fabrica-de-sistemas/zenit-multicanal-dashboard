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
      return res.status(401).json({
        error: 'Token não fornecido',
        code: 'TOKEN_MISSING'
      });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({
        error: 'Token não fornecido',
        code: 'TOKEN_MISSING'
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret'
      ) as { userId: string; email: string; role?: string; sector?: string };

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        sector: decoded.sector
      };

      next();
    } catch (jwtError) {
      console.error('Erro na verificação do JWT:', jwtError);

      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Sessão expirada, faça login novamente',
          code: 'TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        error: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};