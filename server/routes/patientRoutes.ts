import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

export const patientRouter = Router();

function validatePhoto(photoUrl: unknown) {
  if (!photoUrl) return '';
  const value = String(photoUrl);
  if (value.length > 850_000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    throw new Error('La fotografía debe ser JPG, PNG o WebP y no superar 600 KB.');
  }
  return value;
}

patientRouter.use(authenticateToken);

// GET /api/pacientes
patientRouter.get('/', (req: AuthRequest, res: Response) => {
  const { search, estado } = req.query;
  let patients = Repository.getPatients({
    search: search as string,
    estado: estado as string,
  });

  // RF-02: el profesional solo consulta información básica de SUS pacientes.
  if (req.user?.rol === 'PROFESIONAL') {
    const assigned = Repository.getPatientIdsForProfessional(req.user.id);
    patients = patients.filter((patient: any) => assigned.has(patient.id));
  }

  return res.status(200).json({ success: true, count: patients.length, data: patients });
});

// GET /api/pacientes/:id
patientRouter.get('/:id', (req: AuthRequest, res: Response) => {
  const patient = Repository.getPatientById(String(req.params.id));
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
  }

  if (req.user?.rol === 'PROFESIONAL') {
    const assigned = Repository.getPatientIdsForProfessional(req.user.id);
    if (!assigned.has(patient.id)) {
      return res.status(403).json({
        success: false,
        message: 'RF-02: El profesional solo puede consultar pacientes con citas asignadas a su agenda.',
      });
    }

    // Información básica + sus propias citas; sin datos financieros.
    return res.status(200).json({
      success: true,
      data: {
        ...patient,
        citas: Repository.getAppointments({ pacienteId: String(req.params.id), profesionalId: req.user.id }),
      },
    });
  }

  // ADMIN/RECEPCIÓN: expediente completo (RF-03).
  const citas = Repository.getAppointments({ pacienteId: String(req.params.id) });
  const pagos = Repository.getPayments({ pacienteId: String(req.params.id) });

  return res.status(200).json({
    success: true,
    data: {
      ...patient,
      citas,
      pagos,
    },
  });
});

// POST /api/pacientes
patientRouter.post('/', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const { nombres, apellidos, fechaNacimiento, sexo, telefono, direccion, fechaInicio, observaciones, fotoUrl, responsableIds } = req.body;

    if (!nombres || !apellidos || !fechaNacimiento) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Nombres, apellidos y fecha de nacimiento son obligatorios',
      });
    }

    const created = await Repository.createPatient({
      nombres,
      apellidos,
      fechaNacimiento,
      sexo: sexo || 'M',
      telefono: telefono || '',
      direccion: direccion || '',
      fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
      observaciones: observaciones || '',
      fotoUrl: validatePhoto(fotoUrl),
      estado: 'ACTIVO',
      responsableIds: responsableIds || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/pacientes/:id
patientRouter.put('/:id', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const updated = await Repository.updatePatient(String(req.params.id), {
      ...req.body,
      ...(req.body?.fotoUrl !== undefined ? { fotoUrl: validatePhoto(req.body.fotoUrl) } : {}),
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    return res.status(200).json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/pacientes/:id/estado (RF-03: Desactivación mediante eliminación lógica)
patientRouter.patch('/:id/estado', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const { estado } = req.body;
    if (!['ACTIVO', 'INACTIVO'].includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado debe ser ACTIVO o INACTIVO' });
    }

    const updated = await Repository.updatePatient(String(req.params.id), { estado });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }

    return res.status(200).json({
      success: true,
      message: `Paciente marcado como ${estado} exitosamente (eliminación lógica)`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/pacientes/:id/citas
patientRouter.get('/:id/citas', (req: AuthRequest, res: Response) => {
  const citas = Repository.getAppointments({
    pacienteId: String(req.params.id),
    profesionalId: req.user?.rol === 'PROFESIONAL' ? req.user.id : undefined,
  });
  return res.status(200).json({ success: true, count: citas.length, data: citas });
});

// GET /api/pacientes/:id/pagos (datos financieros: solo ADMIN/RECEPCIÓN)
patientRouter.get('/:id/pagos', requireRole(['ADMIN', 'RECEPCION']), (req, res: Response) => {
  const pagos = Repository.getPayments({ pacienteId: String(req.params.id) });
  return res.status(200).json({ success: true, count: pagos.length, data: pagos });
});
