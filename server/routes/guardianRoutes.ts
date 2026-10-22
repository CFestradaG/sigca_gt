import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

export const guardianRouter = Router();

function validatePhoto(photoUrl: unknown) {
  if (!photoUrl) return '';
  const value = String(photoUrl);
  if (value.length > 850_000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    throw new Error('La fotografía debe ser JPG, PNG o WebP y no superar 600 KB.');
  }
  return value;
}

guardianRouter.use(authenticateToken);

// GET /api/responsables
guardianRouter.get('/', (req: AuthRequest, res: Response) => {
  let list = Repository.getGuardians();

  // RF-02: el profesional solo accede a responsables de sus propios pacientes.
  if (req.user?.rol === 'PROFESIONAL') {
    const assigned = Repository.getPatientIdsForProfessional(req.user.id);
    list = list.filter((guardian: any) =>
      (guardian.patientIds || []).some((patientId: string) => assigned.has(patientId)) ||
      (guardian.pacientesAsociados || []).some((patient: any) => assigned.has(patient.id)),
    );
  }

  return res.status(200).json({ success: true, count: list.length, data: list });
});

// GET /api/responsables/:id
guardianRouter.get('/:id', (req: AuthRequest, res: Response) => {
  const guardian: any = Repository.getGuardianById(String(req.params.id));
  if (!guardian) {
    return res.status(404).json({ success: false, message: 'Responsable no encontrado' });
  }

  if (req.user?.rol === 'PROFESIONAL') {
    const assigned = Repository.getPatientIdsForProfessional(req.user.id);
    const related =
      (guardian.patientIds || []).some((patientId: string) => assigned.has(patientId)) ||
      (guardian.pacientesAsociados || []).some((patient: any) => assigned.has(patient.id));
    if (!related) {
      return res.status(403).json({
        success: false,
        message: 'RF-02: El profesional solo puede consultar responsables de sus pacientes.',
      });
    }
  }

  return res.status(200).json({ success: true, data: guardian });
});

// POST /api/responsables
guardianRouter.post('/', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const { nombres, apellidos, parentesco, telefono, email, direccion, fotoUrl, patientIds } = req.body;

    if (!nombres || !apellidos || !parentesco || !telefono) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Nombres, apellidos, parentesco y teléfono son campos obligatorios',
      });
    }

    const created = await Repository.createGuardian({
      nombres,
      apellidos,
      parentesco,
      telefono,
      email: email || '',
      direccion: direccion || '',
      fotoUrl: validatePhoto(fotoUrl),
      patientIds: patientIds || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Responsable registrado y asociado exitosamente',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/responsables/:id
guardianRouter.put('/:id', requireRole(['ADMIN', 'RECEPCION']), async (req, res: Response) => {
  try {
    const updated = await Repository.updateGuardian(String(req.params.id), {
      ...req.body,
      ...(req.body?.fotoUrl !== undefined ? { fotoUrl: validatePhoto(req.body.fotoUrl) } : {}),
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Responsable no encontrado' });
    }
    return res.status(200).json({
      success: true,
      message: 'Responsable actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
