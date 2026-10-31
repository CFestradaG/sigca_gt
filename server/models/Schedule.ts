import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  id: string;
  dia: string; // 'Lunes', 'Martes', etc.
  diaNumero: number; // 1 (Lunes) to 7 (Domingo)
  activo: boolean;
  horaApertura: string; // '08:00'
  horaCierre: string; // '18:00'
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    id: { type: String, required: true, unique: true },
    dia: { type: String, required: true },
    diaNumero: { type: Number, required: true },
    activo: { type: Boolean, default: true },
    horaApertura: { type: String, required: true },
    horaCierre: { type: String, required: true },
  },
  { timestamps: true }
);

export const ScheduleModel = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);
