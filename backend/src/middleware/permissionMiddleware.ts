// backend/src/middleware/permissionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { Permission, sectorPermissions, adminPermissions } from '../config/permissions';

export const requirePermission = (requiredPermission: Permission) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      // Admins têm todas as permissões
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Verifica se o setor existe e tem permissões
      const userSector = req.user.sector || '';
      const sectorPerms = sectorPermissions[userSector];
      
      if (!sectorPerms) {
        return res.status(403).json({ error: 'Setor não tem permissões definidas' });
      }

      // Verifica se o setor tem a permissão necessária
      if (!sectorPerms.includes(requiredPermission)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};