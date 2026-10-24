import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'ADMIN' | 'RECEPCION' | 'PROFESIONAL';
  especialidad?: string;
  telefono?: string;
  avatarUrl?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rol: { type: String, required: true, enum: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
    especialidad: { type: String },
    telefono: { type: String },
    avatarUrl: { type: String },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
