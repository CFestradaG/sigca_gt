import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  numeroComprobante: string;
  pacienteId: string;
  citaId: string;
  cajaId: string;
  montoQ: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
  fecha: string;
  concepto: string;
  notas?: string;
  atendidoPor: string;
  usuarioId: string;
  estado: 'REGISTRADO' | 'ANULADO';
  motivoAnulacion?: string;
  anuladoPor?: string;
  fechaAnulacion?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    id: { type: String, required: true, unique: true },
    numeroComprobante: { type: String, required: true, unique: true },
    pacienteId: { type: String, required: true },
    citaId: { type: String, required: true },
    cajaId: { type: String, required: true },
    montoQ: { type: Number, required: true, min: 0.01 },
    metodoPago: { type: String, required: true, enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'] },
    fecha: { type: String, required: true },
    concepto: { type: String, required: true },
    notas: { type: String, default: '' },
    atendidoPor: { type: String, required: true },
    usuarioId: { type: String, required: true },
    estado: { type: String, required: true, enum: ['REGISTRADO', 'ANULADO'], default: 'REGISTRADO' },
    motivoAnulacion: { type: String },
    anuladoPor: { type: String },
    fechaAnulacion: { type: String },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
