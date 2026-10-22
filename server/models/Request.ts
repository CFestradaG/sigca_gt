import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointmentRequest extends Document {
  id: string;
  solicitanteNombre: string;
  email: string;
  telefono: string;
  servicioId: string;
  fechaPreferida: string;
  sedePreferida: string;
  mensaje: string;
  estado: 'PENDIENTE' | 'ATENDIDA' | 'RECHAZADA';
  fechaCreacion: string;
  citaGeneradaId?: string;
}

const RequestSchema = new Schema<IAppointmentRequest>(
  {
    id: { type: String, required: true, unique: true },
    solicitanteNombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    servicioId: { type: String, required: true },
    fechaPreferida: { type: String, required: true },
    sedePreferida: { type: String, default: 'Sede Central' },
    mensaje: { type: String, default: '' },
    estado: {
      type: String,
      required: true,
      enum: ['PENDIENTE', 'ATENDIDA', 'RECHAZADA'],
      default: 'PENDIENTE',
    },
    fechaCreacion: { type: String, required: true },
    citaGeneradaId: { type: String },
  },
  { timestamps: true }
);

export const RequestModel = mongoose.models.Request || mongoose.model<IAppointmentRequest>('Request', RequestSchema);
