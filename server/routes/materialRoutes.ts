import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const materialRouter = Router();

materialRouter.use(authenticateToken);

// GET /api/materiales
materialRouter.get('/', (req, res: Response) => {
  const { pacienteId } = req.query;
  const list = Repository.getMaterials(pacienteId as string);
  return res.status(200).json({ success: true, count: list.length, data: list });
});

// POST /api/materiales
materialRouter.post('/', requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const { titulo, descripcion, tipo, enlaceRecurso, estado, assignedPatientIds } = req.body;
    if (!titulo?.trim() || !descripcion?.trim() || !tipo || !enlaceRecurso?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Título, descripción, tipo y enlace del recurso son obligatorios',
      });
    }
    if (!['GUIA', 'FICHA', 'AUDIO', 'EJERCICIO', 'VIDEO'].includes(tipo)) {
      return res.status(400).json({ success: false, message: 'Tipo de material inválido' });
    }

    const created = await Repository.createMaterial({
      titulo,
      descripcion,
      tipo,
      enlaceRecurso,
      estado,
      assignedPatientIds,
    });

    return res.status(201).json({
      success: true,
      message: 'Material educativo registrado exitosamente',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/materiales/:id
materialRouter.put('/:id', requireRole(['ADMIN']), async (req, res: Response) => {
  try {
    const updated = await Repository.updateMaterial(String(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Material no encontrado' });
    return res.status(200).json({
      success: true,
      message: 'Material actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/materiales/:id/asignar (RN-09: Assign to ACTIVE patient only)
materialRouter.post('/:id/asignar', requireRole(['ADMIN', 'PROFESIONAL']), async (req, res: Response) => {
  try {
    const { pacienteId } = req.body;
    if (!pacienteId) {
      return res.status(400).json({ success: false, message: 'Debe especificar el pacienteId' });
    }

    const updated = await Repository.assignMaterialToPatient(String(req.params.id), pacienteId);
    return res.status(200).json({
      success: true,
      message: 'Material asignado al paciente exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});
