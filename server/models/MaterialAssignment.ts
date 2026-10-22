import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterialAssignment extends Document {
  id: string;
  materialId: string;
  pacienteId: string;
  profesionalId: string;
  fechaAsignacion: string;
  notas?: string;
}

const MaterialAssignmentSchema = new Schema<IMaterialAssignment>(
  {
    id: { type: String, required: true, unique: true },
    materialId: { type: String, required: true },
    pacienteId: { type: String, required: true },
    profesionalId: { type: String, required: true },
    fechaAsignacion: { type: String, required: true },
    notas: { type: String, default: '' },
  },
  { timestamps: true }
);

export const MaterialAssignmentModel =
  mongoose.models.MaterialAssignment || mongoose.model<IMaterialAssignment>('MaterialAssignment', MaterialAssignmentSchema);
