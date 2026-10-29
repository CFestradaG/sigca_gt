import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole } from '../middleware/auth';

export const userRouter = Router();

// Directorio mínimo para que cualquier rol autenticado pueda mostrar nombres de
// profesionales en agendas/filtros. No expone correo, teléfono ni hashes.
userRouter.get('/directorio', authenticateToken, (_req, res: Response) => {
  const data = Repository.getUsers()
    .filter((user: any) => user.activo)
    .map((user: any) => ({
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
      especialidad: user.especialidad,
    }));
  return res.status(200).json({ success: true, count: data.length, data });
});

// Require ADMIN role for user management (RF-13, RN-10)
userRouter.use(authenticateToken, requireRole(['ADMIN']));

// GET /api/usuarios
userRouter.get('/', (_req, res: Response) => {
  const users = Repository.getUsers();
  return res.status(200).json({ success: true, count: users.length, data: users });
});

// GET /api/usuarios/:id
userRouter.get('/:id', (req, res: Response) => {
  const user = Repository.getUserById(String(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }
  return res.status(200).json({ success: true, data: user });
});

// POST /api/usuarios
userRouter.post('/', async (req, res: Response) => {
  try {
    const { nombre, email, password, rol, especialidad, telefono, avatarUrl } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Datos incompletos. Nombre, correo, contraseña y rol son obligatorios.',
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 ||
      !['ADMIN', 'RECEPCION', 'PROFESIONAL'].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: 'Correo, contraseña (mínimo 8 caracteres) o rol no válido.',
      });
    }

    const existing = Repository.getUserByEmail(email.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con este correo electrónico',
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = await Repository.createUser({
      nombre,
      email: email.trim().toLowerCase(),
      passwordHash,
      rol,
      especialidad,
      telefono,
      avatarUrl,
      activo: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/usuarios/:id
userRouter.put('/:id', async (req, res: Response) => {
  try {
    const id = String(req.params.id);
    const { nombre, email, rol, especialidad, telefono, avatarUrl, activo } = req.body;
    if (rol !== undefined && !['ADMIN', 'RECEPCION', 'PROFESIONAL'].includes(rol)) {
      return res.status(400).json({ success: false, message: 'Rol de usuario inválido.' });
    }
    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Correo electrónico no válido.' });
      }
      const existing = Repository.getUserByEmail(email.trim());
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese correo.' });
      }
    }
    const updates = Object.fromEntries(
      Object.entries({
        nombre: typeof nombre === 'string' ? nombre.trim() : undefined,
        email: typeof email === 'string' ? email.trim().toLowerCase() : undefined,
        rol,
        especialidad,
        telefono,
        avatarUrl,
        activo: typeof activo === 'boolean' ? activo : undefined,
      }).filter(([, value]) => value !== undefined)
    );
    const updated = await Repository.updateUser(id, updates);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/usuarios/:id/password (RF-13)
userRouter.patch('/:id/password', async (req, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const updated = await Repository.updateUser(String(req.params.id), { passwordHash });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
