// backend/src/routes/adminRoutes.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router: Router = express.Router();

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Wrapper function para converter handlers async para o formato esperado
const asyncHandler = (handler: AsyncRequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Middlewares
router.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authMiddleware(req as any, res, next);
  } catch (error) {
    next(error);
  }
});

router.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminMiddleware(req as any, res, next);
  } catch (error) {
    next(error);
  }
});

// Rotas de usuários
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Rota GET /users acessada');
    console.log('Request headers:', req.headers);

    await adminController.listUsers(req, res);
  } catch (error) {
    console.error('Erro na rota /users:', error);
    next(error);
  }
});

router.post('/users', asyncHandler(async (req, res) => {
  await adminController.createUser(req, res);
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
  await adminController.updateUser(req, res);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  await adminController.deleteUser(req, res);
}));

router.put('/users/:id/status', asyncHandler(async (req, res) => {
  await adminController.updateUserStatus(req, res);
}));

router.put('/users/:id/role', asyncHandler(async (req, res) => {
  await adminController.updateUserRole(req, res);
}));

export default router;