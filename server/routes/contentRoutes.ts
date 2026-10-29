import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const contentRouter = Router();

// GET /api/contenido (Public for landing page)
contentRouter.get('/', (_req, res: Response) => {
  const content = Repository.getContent();
  return res.status(200).json({ success: true, data: content });
});

// PUT /api/contenido (Protected ADMIN only RF-12)
contentRouter.put('/', authenticateToken, requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const updated = await Repository.updateContent(req.body);
    return res.status(200).json({
      success: true,
      message: 'Contenido institucional actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/horarios (Public)
export const scheduleRouter = Router();

scheduleRouter.get('/', (_req, res: Response) => {
  const schedules = Repository.getSchedules();
  return res.status(200).json({ success: true, data: schedules });
});

// PUT /api/horarios/:id (Protected ADMIN)
scheduleRouter.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const updated = await Repository.updateSchedule(String(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Horario no encontrado' });
    return res.status(200).json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
