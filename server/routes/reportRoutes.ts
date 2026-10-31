import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const reportRouter = Router();

reportRouter.use(authenticateToken);

// RF-02: las métricas financieras del tablero no se exponen al PROFESIONAL.
reportRouter.use(requireRole(['ADMIN', 'RECEPCION']));

// GET /api/reportes/dashboard
reportRouter.get('/dashboard', (_req, res: Response) => {
  const metrics = Repository.getDashboardMetrics();
  return res.status(200).json({ success: true, data: metrics });
});
