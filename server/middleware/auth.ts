import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Repository } from '../data/repository';

export const JWT_SECRET = process.env.JWT_SECRET || '';

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'RECEPCION' | 'PROFESIONAL';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: { id: string; nombre: string; email: string; rol: string }): string {
  return jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado: Token no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // El token no es prueba suficiente: el usuario pudo ser desactivado o
    // cambiar de rol después de emitido. Se revalida contra la fuente actual.
    const currentUser = Repository.getUserById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido: el usuario ya no existe.',
      });
    }
    if (!currentUser.activo) {
      return res.status(403).json({
        success: false,
        message: 'RN-08: Su usuario se encuentra inactivo.',
      });
    }

    req.user = {
      id: currentUser.id,
      nombre: currentUser.nombre,
      email: currentUser.email,
      rol: currentUser.rol,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Inicie sesión nuevamente.',
    });
  }
}

export function requireRole(allowedRoles: Array<'ADMIN' | 'RECEPCION' | 'PROFESIONAL'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: No se encontró sesión',
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: El rol ${req.user.rol} no tiene permisos para esta acción`,
      });
    }

    next();
  };
}
