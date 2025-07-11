import { Router, Request, Response, NextFunction } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';

const router: Router = Router();

// Função auxiliar para tratar erros em rotas assíncronas
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware de autenticação para todas as rotas
router.use(authMiddleware as any);

// Middleware de permissão para todas as rotas
router.use(requirePermission('view_marketing_analytics') as any);

// Rotas
router.get('/', asyncHandler(analyticsController.getAnalytics));
router.get('/export', asyncHandler(analyticsController.exportAnalytics));

export default router;