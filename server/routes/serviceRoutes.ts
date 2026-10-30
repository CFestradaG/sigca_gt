import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const serviceRouter = Router();

// GET /api/servicios (Publicly available for the landing page RF-01, RF-05)
serviceRouter.get('/', (req, res: Response) => {
  const onlyActive = req.query.all !== 'true';
  const services = Repository.getServices(onlyActive);
  return res.status(200).json({ success: true, count: services.length, data: services });
});

// GET /api/servicios/:id
serviceRouter.get('/:id', (req, res: Response) => {
  const s = Repository.getServiceById(String(req.params.id));
  if (!s) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
  return res.status(200).json({ success: true, data: s });
});

// Protected routes below
serviceRouter.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const { nombre, descripcion, duracionMinutos, precioQ, imagenUrl, estado, categoria } = req.body;
    if (!nombre || !descripcion || !duracionMinutos || precioQ === undefined) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Nombre, descripción, duración y precio son campos obligatorios',
      });
    }

    const created = await Repository.createService({
      nombre,
      descripcion,
      duracionMinutos,
      precioQ,
      imagenUrl,
      estado,
      categoria,
    });

    return res.status(201).json({
      success: true,
      message: 'Servicio clínico creado exitosamente',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/servicios/:id
serviceRouter.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const updated = await Repository.updateService(String(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    return res.status(200).json({
      success: true,
      message: 'Servicio clínico actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/servicios/:id/estado
serviceRouter.patch('/:id/estado', authenticateToken, requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const { estado } = req.body;
    if (!['ACTIVO', 'INACTIVO'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado debe ser ACTIVO o INACTIVO' });
    }
    const updated = await Repository.updateService(String(req.params.id), { estado });
    if (!updated) return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    return res.status(200).json({
      success: true,
      message: `Servicio marcado como ${estado}`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
