// backend/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { AuthRequest } from '../middleware/authMiddleware';

export const adminController = {
  async listUsers(req: Request, res: Response) {
    try {
      const users = await adminService.listUsers();
      return res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  },

  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await adminService.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const user = await adminService.updateUser(id, userData);
      return res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  },

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await adminService.updateUserStatus(id, status);
      return res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
    }
  },

  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await adminService.updateUserRole(id, role);
      return res.json(user);
    } catch (error) {
      console.error('Erro ao atualizar função do usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar função do usuário' });
    }
  },

  async listSectors(req: Request, res: Response) {
    try {
      const sectors = await adminService.listSectors();
      return res.json(sectors);
    } catch (error) {
      console.error('Erro ao listar setores:', error);
      return res.status(500).json({ error: 'Erro ao listar setores' });
    }
  },

  async createSector(req: Request, res: Response) {
    try {
      const sectorData = req.body;
      const sector = await adminService.createSector(sectorData);
      return res.status(201).json(sector);
    } catch (error) {
      console.error('Erro ao criar setor:', error);
      return res.status(500).json({ error: 'Erro ao criar setor' });
    }
  },

  async updateSector(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sectorData = req.body;
      const sector = await adminService.updateSector(id, sectorData);
      return res.json(sector);
    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      return res.status(500).json({ error: 'Erro ao atualizar setor' });
    }
  },

  async deleteSector(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await adminService.deleteSector(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar setor:', error);
      return res.status(500).json({ error: 'Erro ao deletar setor' });
    }
  }
};