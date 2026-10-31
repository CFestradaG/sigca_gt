import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const requestRouter = Router();

// POST /api/solicitudes-cita (Public - allows visitors to request an appointment RF-01, RF-06)
requestRouter.post('/', async (req, res: Response) => {
  try {
    const { solicitanteNombre, email, telefono, servicioId, fechaPreferida, sedePreferida, mensaje } = req.body;

    if (!solicitanteNombre || !email || !telefono || !servicioId || !fechaPreferida) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Nombre, correo, teléfono, servicio y fecha preferida son obligatorios',
      });
    }

    const created = await Repository.createRequest({
      solicitanteNombre,
      email,
      telefono,
      servicioId,
      fechaPreferida,
      sedePreferida,
      mensaje,
    });

    return res.status(201).json({
      success: true,
      message: 'Su solicitud de cita ha sido recibida con éxito. Nuestro equipo se comunicará para confirmar.',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Protected routes for staff
requestRouter.use(authenticateToken, requireRole(['ADMIN', 'RECEPCION']));

// GET /api/solicitudes-cita
requestRouter.get('/', (req, res: Response) => {
  const { estado } = req.query;
  const list = Repository.getRequests(estado as string);
  return res.status(200).json({ success: true, count: list.length, data: list });
});

// PATCH /api/solicitudes-cita/:id/estado
requestRouter.patch('/:id/estado', async (req, res: Response) => {
  try {
    const { estado, citaGeneradaId } = req.body;
    if (!['PENDIENTE', 'ATENDIDA', 'RECHAZADA'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado debe ser PENDIENTE, ATENDIDA o RECHAZADA' });
    }

    const updated = await Repository.updateRequestStatus(String(req.params.id), estado, citaGeneradaId);
    if (!updated) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });

    return res.status(200).json({
      success: true,
      message: `Solicitud marcada como ${estado}`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/solicitudes-cita/:id/convertir (RF-06: Convert request into appointment for a patient)
requestRouter.post('/:id/convertir', async (req, res: Response) => {
  try {
    const { pacienteId, profesionalId, fecha, horaInicio, sede, observaciones } = req.body;

    const reqItem = Repository.getRequests().find((r: any) => r.id === String(req.params.id));
    if (!reqItem) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });

    const newApp = await Repository.createAppointment({
      pacienteId,
      servicioId: reqItem.servicioId,
      profesionalId,
      fecha: fecha || reqItem.fechaPreferida,
      horaInicio,
      sede: sede || reqItem.sedePreferida,
      observaciones: observaciones || `Generada desde solicitud pública: ${reqItem.solicitanteNombre}`,
    });

    await Repository.updateRequestStatus(String(req.params.id), 'ATENDIDA', newApp.id);

    return res.status(201).json({
      success: true,
      message: 'Solicitud convertida en cita confirmada exitosamente',
      data: newApp,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});
