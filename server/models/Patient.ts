import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  id: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: 'M' | 'F' | 'Otro';
  telefono: string;
  direccion: string;
  fechaInicio: string;
  observaciones: string;
  fotoUrl?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  responsableIds: string[];
}

const PatientSchema = new Schema<IPatient>(
  {
    id: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    fechaNacimiento: { type: String, required: true },
    sexo: { type: String, required: true, enum: ['M', 'F', 'Otro'] },
    telefono: { type: String, default: '' },
    direccion: { type: String, default: '' },
    fechaInicio: { type: String, required: true },
    observaciones: { type: String, default: '' },
    fotoUrl: { type: String, default: '' },
    estado: { type: String, required: true, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
    responsableIds: [{ type: String }],
  },
  { timestamps: true }
);

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
