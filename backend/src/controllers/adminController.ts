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
            const { id } = req.params;
            const { fullName, email, role, sector } = req.body;

            console.log('Atualizando usuário:', { id, fullName, email, role, sector });

            const checkUser = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
            if (checkUser.length > 0) {
                return res.status(400).json({ error: 'Este email já está em uso' });
            }

            await execute(
                `
            UPDATE users
            SET full_name = ?,
                email = ?,
                role = ?,
                sector = ?,
                updated_at = NOW()
            WHERE id = ?
            `,
                [fullName, email, role, sector, id]
            );

            console.log('Usuário atualizado com sucesso');

            const [updatedUser] = await query(
                `SELECT id, full_name as fullName, email, role, sector 
             FROM users WHERE id = ?`,
                [id]
            );

            return res.json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    },

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            console.log('Deletando usuário:', id);

            // Verificar se o usuário existe
            const [user] = await query('SELECT id FROM users WHERE id = ?', [id]);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Deletar o usuário
            await execute('DELETE FROM users WHERE id = ?', [id]);

            console.log('Usuário deletado com sucesso');

            return res.status(204).send();
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
            console.log('Iniciando listagem de setores...');

            // Primeiro, buscar os setores
            const sectorsQuery = `
            SELECT 
              s.id,
              s.name,
              COALESCE(u.user_count, 0) as totalUsers,
              GROUP_CONCAT(r.name) as roles
            FROM sectors s
            LEFT JOIN (
              SELECT sector_id, COUNT(*) as user_count
              FROM users
              GROUP BY sector_id
            ) u ON s.id = u.sector_id
            LEFT JOIN roles r ON r.sector_id = s.id
            GROUP BY s.id, s.name
            ORDER BY s.name
          `;

            console.log('Executando query:', sectorsQuery);
            const sectors = await query(sectorsQuery);

            console.log('Setores encontrados:', sectors);
            return res.json(sectors);

        } catch (error) {
            console.error('Erro detalhado ao listar setores:', error);
            return res.status(500).json({
                error: 'Erro ao listar setores',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    },
    async getSectorRoles(req: Request, res: Response) {
        try {
            const sectors = await query(`
            SELECT 
              s.id as sectorId,
              s.name as sectorName,
              r.id as roleId,
              r.name as roleName
            FROM sectors s
            LEFT JOIN roles r ON r.sector_id = s.id
            ORDER BY s.name, r.name
          `);

            // Formatar os dados para o formato esperado pelo frontend
            const formattedSectors: { [key: string]: string[] } = {};
            sectors.forEach((row: any) => {
                if (!formattedSectors[row.sectorName]) {
                    formattedSectors[row.sectorName] = [];
                }
                if (row.roleName) {
                    formattedSectors[row.sectorName].push(row.roleName);
                }
            });

            return res.json(formattedSectors);
        } catch (error) {
            console.error('Erro ao buscar cargos dos setores:', error);
            return res.status(500).json({ error: 'Erro ao buscar cargos dos setores' });
        }
    },
}