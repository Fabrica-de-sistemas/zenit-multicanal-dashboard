// backend/src/controllers/permissionController.ts
import { Request, Response } from 'express';
import { Permission, sectorPermissions, adminPermissions, VALID_PERMISSIONS } from '../config/permissions';
import { pool, query, execute } from '../lib/db';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

interface UpdatePermissionsResponse {
  message: string;
  token?: string;
}

export const permissionController = {
  async calculateEffectivePermissions(userId: string): Promise<Permission[]> {
    try {
      const [user] = await query(
        'SELECT sector, role FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return [];
      }

      // Se for admin, retorna todas as permissões
      if (user.role === 'ADMIN') {
        return adminPermissions;
      }

      // Busca permissões customizadas
      const [customPermissions] = await query(
        'SELECT permissions FROM user_permissions WHERE user_id = ?',
        [userId]
      );

      // Verifica se existem permissões customizadas
      if (customPermissions?.permissions) {
        // Se permissions for uma string, tenta fazer o parse
        if (typeof customPermissions.permissions === 'string') {
          try {
            return JSON.parse(customPermissions.permissions);
          } catch (error) {
            console.error('Erro ao fazer parse das permissões:', error);
            return [];
          }
        }
        // Se já for um array, retorna diretamente
        if (Array.isArray(customPermissions.permissions)) {
          return customPermissions.permissions;
        }
      }

      // Se não tiver permissões customizadas, retorna as permissões do setor
      return sectorPermissions[user.sector] || [];
    } catch (error) {
      console.error('Erro ao calcular permissões:', error);
      return [];
    }
  },


  async getAllSectorPermissions(req: Request, res: Response) {
    try {
      res.json(sectorPermissions);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      res.status(500).json({ error: 'Erro ao buscar permissões dos setores' });
    }
  },

  async getUserPermissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const permissions = await this.calculateEffectivePermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar permissões do usuário' });
    }
  },

  async updateSectorPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { sector } = req.params;
      const { permissions } = req.body;

      // Primeiro atualiza no banco
      await execute(
        'UPDATE sectors SET permissions = ? WHERE name = ?',
        [JSON.stringify(permissions), sector]
      );

      // Depois atualiza no objeto em memória
      sectorPermissions[sector] = permissions as Permission[];

      // Notifica os clientes via Socket.IO
      req.app.get('io').emit('sectorPermissionsUpdated', {
        sector,
        permissions
      });

      res.json({ message: 'Permissões atualizadas com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar permissões do setor:', error);
      res.status(500).json({ error: 'Erro ao atualizar permissões do setor' });
    }
  },

  async updateUserCustomPermissions(req: Request, res: Response) {
    const connection = await pool.getConnection();
    
    try {
      const { userId } = req.params;
      const { permissions: newPermissions } = req.body;

      // Validação dos dados de entrada
      if (!userId || !Array.isArray(newPermissions)) {
        console.error('Dados inválidos recebidos:', { userId, newPermissions });
        return res.status(400).json({
          error: 'Dados inválidos',
          details: 'userId e permissions são obrigatórios. permissions deve ser um array'
        });
      }

      // Verifica se o usuário existe
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id, full_name as fullName, email, role, sector FROM users WHERE id = ?',
        [userId]
      );
      
      const user = rows[0];

      if (!user) {
        console.error('Usuário não encontrado:', userId);
        return res.status(404).json({
          error: 'Usuário não encontrado',
          details: 'O ID do usuário fornecido não existe no sistema'
        });
      }

      try {
        // Inicia a transação
        await connection.beginTransaction();

        // Remove permissões antigas
        await connection.query(
          'DELETE FROM user_permissions WHERE user_id = ?',
          [userId]
        );

        // Insere novas permissões
        if (newPermissions.length > 0) {
          await connection.query(
            'INSERT INTO user_permissions (id, user_id, permissions) VALUES (UUID(), ?, ?)',
            [userId, JSON.stringify(newPermissions)]
          );
        }

        // Confirma a transação
        await connection.commit();

        // Gera novo token
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
            sector: user.sector,
            permissions: newPermissions
          },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' }
        );

        // Emite evento via Socket.IO se disponível
        if (req.app.get('io')) {
          req.app.get('io').emit(`permissionsUpdated:${userId}`, {
            userId,
            permissions: newPermissions,
            token
          });
        }

        return res.json({
          success: true,
          token,
          permissions: newPermissions
        });

      } catch (error) {
        // Reverte a transação em caso de erro
        await connection.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Erro não tratado ao atualizar permissões:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      connection.release(); // Sempre libera a conexão
    }
  }
};