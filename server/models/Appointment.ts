import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  id: string;
  pacienteId: string;
  servicioId: string;
  profesionalId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  precioQ: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  observaciones: string;
  sede: string;
  fechaCreacion: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    id: { type: String, required: true, unique: true },
    pacienteId: { type: String, required: true },
    servicioId: { type: String, required: true },
    profesionalId: { type: String, required: true },
    fecha: { type: String, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    precioQ: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      required: true,
      enum: ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'],
      default: 'PENDIENTE',
    },
    observaciones: { type: String, default: '' },
    sede: { type: String, default: 'Sede Central - Zona 10' },
    fechaCreacion: { type: String, required: true },
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
