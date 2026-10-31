import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precioQ: number;
  imagenUrl: string;
  estado: 'ACTIVO' | 'INACTIVO';
  categoria: string;
}

const ServiceSchema = new Schema<IService>(
  {
    id: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    duracionMinutos: { type: Number, required: true, min: 10 },
    precioQ: { type: Number, required: true, min: 0 },
    imagenUrl: { type: String, default: '' },
    estado: { type: String, required: true, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
    categoria: { type: String, default: 'General' },
  },
  { timestamps: true }
);

export const ServiceModel = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
