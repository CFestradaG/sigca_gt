import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'GUIA' | 'FICHA' | 'AUDIO' | 'EJERCICIO' | 'VIDEO';
  enlaceRecurso: string;
  fechaRegistro: string;
  estado: 'ACTIVO' | 'INACTIVO';
  assignedPatientIds: string[];
}

const MaterialSchema = new Schema<IMaterial>(
  {
    id: { type: String, required: true, unique: true },
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    tipo: {
      type: String,
      required: true,
      enum: ['GUIA', 'FICHA', 'AUDIO', 'EJERCICIO', 'VIDEO'],
    },
    enlaceRecurso: { type: String, required: true },
    fechaRegistro: { type: String, required: true },
    estado: { type: String, required: true, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
    assignedPatientIds: [{ type: String }],
  },
  { timestamps: true }
);

export const MaterialModel = mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);
