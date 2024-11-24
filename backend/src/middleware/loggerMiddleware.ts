// backend/src/middleware/loggerMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== NOVA REQUISIÇÃO ===');
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.method === 'POST' ? {
    ...req.body,
    password: req.body.password ? '[PROTEGIDO]' : undefined
  } : null);
  console.log('=== FIM DOS DADOS DA REQUISIÇÃO ===\n');

  next();
};