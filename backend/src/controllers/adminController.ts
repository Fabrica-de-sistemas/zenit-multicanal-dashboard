// backend/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { query, execute } from '../lib/db';

export const adminController = {
    async listUsers(req: Request, res: Response) {
        try {
            console.log('Iniciando listagem de usuários...');

            const sqlQuery = `
            SELECT 
              id,
              full_name as fullName,
              email,
              role,
              sector,
              created_at as createdAt,
              updated_at as updatedAt
            FROM users
            ORDER BY full_name;
          `;

            console.log('Executando query:', sqlQuery);

            const result = await query(sqlQuery);
            console.log('Resultado da query:', result);

            // Se não houver usuários, retornar array vazio
            if (!result || !Array.isArray(result)) {
                console.log('Nenhum usuário encontrado ou resultado inválido');
                return res.json([]);
            }

            const users = result.map(user => ({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                sector: user.sector,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));

            console.log('Usuários processados:', users);
            return res.json(users);

        } catch (error) {
            console.error('Erro detalhado ao listar usuários:', error);
            return res.status(500).json({
                error: 'Erro ao listar usuários',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    },

    async createUser(req: Request, res: Response) {
        try {
            // Implementar criação de usuário
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    },

    async updateUser(req: Request, res: Response) {
        try {
            // Implementar atualização de usuário
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    },

    async deleteUser(req: Request, res: Response) {
        try {
            // Implementar deleção de usuário
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    },

    async updateUserStatus(req: Request, res: Response) {
        try {
            // Implementar atualização de status do usuário
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao atualizar status do usuário:', error);
            return res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
        }
    },

    async updateUserRole(req: Request, res: Response) {
        try {
            // Implementar atualização de role do usuário
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao atualizar role do usuário:', error);
            return res.status(500).json({ error: 'Erro ao atualizar role do usuário' });
        }
    },

    async listSectors(req: Request, res: Response) {
        try {
            // Implementar listagem de setores
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao listar setores:', error);
            return res.status(500).json({ error: 'Erro ao listar setores' });
        }
    },

    async createSector(req: Request, res: Response) {
        try {
            // Implementar criação de setor
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao criar setor:', error);
            return res.status(500).json({ error: 'Erro ao criar setor' });
        }
    },

    async updateSector(req: Request, res: Response) {
        try {
            // Implementar atualização de setor
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao atualizar setor:', error);
            return res.status(500).json({ error: 'Erro ao atualizar setor' });
        }
    },

    async deleteSector(req: Request, res: Response) {
        try {
            // Implementar deleção de setor
            return res.status(501).json({ error: 'Não implementado' });
        } catch (error) {
            console.error('Erro ao deletar setor:', error);
            return res.status(500).json({ error: 'Erro ao deletar setor' });
        }
    }
};