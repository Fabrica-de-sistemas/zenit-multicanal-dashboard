// src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { authController } from '../controllers/authController';
import { adminController } from '../controllers/adminController';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Handlers tipados
const handleRegister = async (req: Request, res: Response) => {
  console.log('Rota /register acessada');
  await authController.register(req, res);
};

const handleLogin = async (req: Request, res: Response) => {
  console.log('Rota /login acessada');
  await authController.login(req, res);
};

const handleProfile = async (req: AuthRequest, res: Response) => {
  console.log('Rota /profile acessada');
  await authController.getProfile(req, res);
};

const handleSector = async (req: AuthRequest, res: Response) => {
  console.log('Rota /sector acessada');
  await authController.updateSector(req, res);
};

const handleListUsers = async (req: Request, res: Response) => {
  return await adminController.listUsers(req, res);
};

// Rotas
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/profile', handleProfile as any);
router.put('/sector', handleSector as any);
router.get('/users', handleListUsers as any);

export default router;