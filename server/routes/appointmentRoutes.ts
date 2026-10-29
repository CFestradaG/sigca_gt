import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

export const appointmentRouter = Router();

appointmentRouter.use(authenticateToken);

appointmentRouter.get('/disponibilidad', (req, res: Response) => {
  const { pacienteId, servicioId, profesionalId, fecha, horaInicio, sede, idToIgnore } = req.query;
  if (!pacienteId || !servicioId || !profesionalId || !fecha || !horaInicio || !sede) {
    return res.status(400).json({ success: false, message: 'Paciente, servicio, profesional, fecha, hora y sede son obligatorios.' });
  }
  const result = Repository.validateAppointmentRules({
    pacienteId: String(pacienteId), servicioId: String(servicioId), profesionalId: String(profesionalId),
    fecha: String(fecha), horaInicio: String(horaInicio), sede: String(sede), idToIgnore: idToIgnore ? String(idToIgnore) : undefined,
  });
  return res.status(200).json({ success: true, data: {
    available: result.valid, message: result.error || `Disponible de ${horaInicio} a ${result.calculatedHoraFin}.`,
    horaFin: result.calculatedHoraFin, precioQ: result.precioQ,
  } });
});

// GET /api/citas
appointmentRouter.get('/', (req: AuthRequest, res: Response) => {
  const { pacienteId, profesionalId, fecha, estado } = req.query;

  // If user is a PROFESIONAL, filter to only their appointments unless they are ADMIN or RECEPCION
  let profId = profesionalId as string;
  if (req.user?.rol === 'PROFESIONAL') {
    profId = req.user.id;
  }

  const appointments = Repository.getAppointments({
    pacienteId: pacienteId as string,
    profesionalId: profId,
    fecha: fecha as string,
    estado: estado as string,
  });

  return res.status(200).json({ success: true, count: appointments.length, data: appointments });
});

// GET /api/citas/:id
appointmentRouter.get('/:id', (req: AuthRequest, res: Response) => {
  const app = Repository.getAppointmentById(String(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Cita no encontrada' });
  }

  // RF-02: el profesional solo consulta citas asignadas a él.
  if (req.user?.rol === 'PROFESIONAL' && app.profesionalId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'RF-02: El profesional solo puede consultar sus propias citas asignadas.',
    });
  }

  return res.status(200).json({ success: true, data: app });
});

// POST /api/citas (solo ADMIN/RECEPCIÓN programan citas)
appointmentRouter.post('/', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const { pacienteId, servicioId, profesionalId, fecha, horaInicio, observaciones, sede } = req.body;

    if (!pacienteId || !servicioId || !profesionalId || !fecha || !horaInicio || !sede) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Todos los datos son requeridos (paciente, servicio, profesional, fecha, horaInicio)',
      });
    }

    const created = await Repository.createAppointment({
      pacienteId,
      servicioId,
      profesionalId,
      fecha,
      horaInicio,
      observaciones,
      sede,
    });

    return res.status(201).json({
      success: true,
      message: 'Cita médica programada exitosamente',
      data: created,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// PUT /api/citas/:id (reprogramar / modificar datos operativos)
// El precio, el paciente y el estado NO se modifican por esta vía (RF-07, RN-05, RN-27).
appointmentRouter.put('/:id', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const allowedFields = ['fecha', 'horaInicio', 'servicioId', 'profesionalId', 'sede', 'observaciones'];
    const unexpectedFields = Object.keys(req.body || {}).filter((field) => !allowedFields.includes(field));
    if (unexpectedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede modificar por PUT: ${unexpectedFields.join(', ')}. El precio y el paciente se fijan al programar la cita y el estado se cambia con PATCH /api/citas/:id/estado.`,
      });
    }

    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([field]) => allowedFields.includes(field)),
    );
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No se enviaron campos modificables.' });
    }

    const updated = await Repository.updateAppointment(String(req.params.id), updates);
    return res.status(200).json({
      success: true,
      message: 'Cita reprogramada exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// PATCH /api/citas/:id/estado (PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA)
appointmentRouter.patch('/:id/estado', async (req: AuthRequest, res: Response) => {
  try {
    const { estado } = req.body;
    if (!['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Opciones: PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA',
      });
    }

    // RF-02: el PROFESIONAL solo puede marcar COMPLETADA una cita propia.
    if (req.user?.rol === 'PROFESIONAL') {
      const appointment = Repository.getAppointmentById(String(req.params.id));
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Cita no encontrada' });
      }
      if (appointment.profesionalId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'RF-02: El profesional solo puede actualizar sus propias citas.',
        });
      }
      if (estado !== 'COMPLETADA') {
        return res.status(403).json({
          success: false,
          message: 'RF-02: El profesional únicamente puede marcar sus citas como COMPLETADA.',
        });
      }
    }

    const updated = await Repository.changeAppointmentStatus(String(req.params.id), estado);
    return res.status(200).json({
      success: true,
      message: `Estado de la cita actualizado a ${estado}`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/citas/:id/pagos (datos financieros: solo ADMIN/RECEPCIÓN)
appointmentRouter.get('/:id/pagos', requireRole(['ADMIN', 'RECEPCION']), (req, res: Response) => {
  const pagos = Repository.getPayments({ citaId: String(req.params.id) });
  return res.status(200).json({ success: true, count: pagos.length, data: pagos });
});

// GET /api/citas/:id/saldo (datos financieros: solo ADMIN/RECEPCIÓN)
appointmentRouter.get('/:id/saldo', requireRole(['ADMIN', 'RECEPCION']), (req, res: Response) => {
  const app = Repository.getAppointmentById(String(req.params.id));
  if (!app) {
    return res.status(404).json({ success: false, message: 'Cita no encontrada' });
  }

  return res.status(200).json({
    success: true,
    data: {
      citaId: app.id,
      precioQ: app.precioQ,
      totalPagadoQ: app.totalPagadoQ,
      saldoPendienteQ: app.saldoPendienteQ,
      estadoFinanciero: app.estadoFinanciero,
    },
  });
});
