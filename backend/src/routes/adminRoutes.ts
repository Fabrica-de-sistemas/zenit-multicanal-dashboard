// backend/src/routes/adminRoutes.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { adminController } from '../controllers/adminController';
import { permissionController } from '../controllers/permissionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router: Router = express.Router();

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler = (handler: Function) => {
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
router.get('/users', asyncHandler(adminController.listUsers));
router.post('/users', asyncHandler(adminController.createUser));
router.put('/users/:id', asyncHandler(adminController.updateUser));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));
router.put('/users/:id/status', asyncHandler(adminController.updateUserStatus));
router.put('/users/:id/role', asyncHandler(adminController.updateUserRole));

// Rotas de permissões
router.get('/permissions/sectors', asyncHandler(async (req: Request, res: Response) => {
  await permissionController.getAllSectorPermissions(req, res);
}));

router.put('/permissions/sectors/:sector', asyncHandler(async (req: Request, res: Response) => {
  await (permissionController as any).updateSectorPermissions(req, res);
}));

router.get('/permissions/users/:userId', asyncHandler(async (req: Request, res: Response) => {
  await permissionController.getUserPermissions(req, res);
}));

router.put('/permissions/users/:userId', asyncHandler(async (req: Request, res: Response) => {
  await permissionController.updateUserCustomPermissions(req, res);
}));

export default router;