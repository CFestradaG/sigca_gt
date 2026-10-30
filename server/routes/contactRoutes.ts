import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const contactRouter = Router();

// POST /api/contacto (Public contact form RF-01)
contactRouter.post('/', async (req, res: Response) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Nombre, correo, asunto y mensaje son obligatorios',
      });
    }

    const created = await Repository.createMessage({
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
    });

    return res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente. Gracias por comunicarse con Centro Armonía.',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Protected routes
contactRouter.use(authenticateToken, requireRole(['ADMIN', 'RECEPCION']));

// GET /api/contacto
contactRouter.get('/', (_req, res: Response) => {
  const list = Repository.getMessages();
  return res.status(200).json({ success: true, count: list.length, data: list });
});

// PATCH /api/contacto/:id/leer
contactRouter.patch('/:id/leer', async (req, res: Response) => {
  try {
    const updated = await Repository.markMessageAsRead(String(req.params.id));
    if (!updated) return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
