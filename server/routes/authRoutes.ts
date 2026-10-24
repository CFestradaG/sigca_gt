import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Repository } from '../data/repository';
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: Debe proporcionar correo electrónico y contraseña',
      });
    }

    const user = Repository.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas: Correo o contraseña incorrectos',
      });
    }

    // RN-08: Inactive users cannot log in
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'RN-08: Su usuario se encuentra inactivo. Contacte a la administración.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas: Correo o contraseña incorrectos',
      });
    }

    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error en autenticación',
    });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticado' });
  }

  const user = Repository.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

authRouter.patch('/me/avatar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const avatarUrl = String(req.body?.avatarUrl || '');
    if (avatarUrl && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatarUrl)) {
      return res.status(400).json({ success: false, message: 'La imagen debe ser JPG, PNG o WebP.' });
    }
    if (avatarUrl.length > 850_000) {
      return res.status(413).json({ success: false, message: 'La imagen excede el tamaño permitido de 600 KB.' });
    }
    const updated = await Repository.updateUser(req.user!.id, { avatarUrl });
    if (!updated) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    return res.status(200).json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'No se pudo guardar la imagen.' });
  }
});
