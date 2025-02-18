// backend/src/middleware/permissionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Permission, sectorPermissions } from '../config/permissions';
import { query } from '../lib/db';

export const requirePermission = (requiredPermission: Permission) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      // Se for admin, tem todas as permissões
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const userId = req.user.userId;
      const userSector = req.user.sector || '';

      // Busca permissões customizadas do usuário
      const [customPermissions] = await query(
        'SELECT permissions FROM user_permissions WHERE user_id = ?',
        [userId]
      );

      // Combina permissões do setor com permissões customizadas
      const sectorPerms = sectorPermissions[userSector] || [];
      const userCustomPerms = customPermissions ? JSON.parse(customPermissions.permissions) : [];

      // As permissões customizadas SUBSTITUEM as permissões do setor
      // Se uma permissão está em userCustomPerms, ela sobrescreve a do setor
      const effectivePermissions = userCustomPerms;

      if (!effectivePermissions.includes(requiredPermission)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};