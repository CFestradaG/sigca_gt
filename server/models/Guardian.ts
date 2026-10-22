import mongoose, { Schema, Document } from 'mongoose';

export interface IGuardian extends Document {
  id: string;
  nombres: string;
  apellidos: string;
  parentesco: string;
  telefono: string;
  email: string;
  direccion: string;
  fotoUrl?: string;
  patientIds: string[];
}

const GuardianSchema = new Schema<IGuardian>(
  {
    id: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    parentesco: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, default: '' },
    direccion: { type: String, default: '' },
    fotoUrl: { type: String, default: '' },
    patientIds: [{ type: String }],
  },
  { timestamps: true }
);

export const GuardianModel = mongoose.models.Guardian || mongoose.model<IGuardian>('Guardian', GuardianSchema);
