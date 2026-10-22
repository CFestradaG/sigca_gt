import mongoose, { Schema, Document } from 'mongoose';

export interface ICashMovement {
  id: string;
  tipo: 'INGRESO' | 'EGRESO';
  montoQ: number;
  concepto: string;
  hora: string;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
  comprobanteRef?: string;
  pagoId?: string;
}

export interface ICashRegister extends Document {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  fecha: string; // YYYY-MM-DD
  fechaApertura: string;
  horaApertura: string;
  montoInicialQ: number;
  estado: 'ABIERTA' | 'CERRADA';
  totalEfectivoQ: number;
  totalTransferenciasQ: number;
  totalTarjetaQ: number;
  totalIngresosQ: number;
  efectivoEsperadoQ: number;
  efectivoContadoQ?: number;
  diferenciaQ?: number;
  fechaCierre?: string;
  horaCierre?: string;
  observacionesCierre?: string;
  // RN-29: usuario responsable del cierre
  usuarioCierreId?: string;
  cerradoPor?: string;
  movimientos: ICashMovement[];
}

const CashMovementSchema = new Schema<ICashMovement>({
  id: { type: String, required: true },
  tipo: { type: String, required: true, enum: ['INGRESO', 'EGRESO'] },
  montoQ: { type: Number, required: true },
  concepto: { type: String, required: true },
  hora: { type: String, required: true },
  metodoPago: { type: String, required: true, enum: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'] },
  comprobanteRef: { type: String },
  pagoId: { type: String },
});

const CashRegisterSchema = new Schema<ICashRegister>(
  {
    id: { type: String, required: true, unique: true },
    usuarioId: { type: String, required: true },
    usuarioNombre: { type: String, required: true },
    fecha: { type: String, required: true },
    fechaApertura: { type: String, required: true },
    horaApertura: { type: String, required: true },
    montoInicialQ: { type: Number, required: true, min: 0 },
    estado: { type: String, required: true, enum: ['ABIERTA', 'CERRADA'], default: 'ABIERTA' },
    totalEfectivoQ: { type: Number, default: 0 },
    totalTransferenciasQ: { type: Number, default: 0 },
    totalTarjetaQ: { type: Number, default: 0 },
    totalIngresosQ: { type: Number, default: 0 },
    efectivoEsperadoQ: { type: Number, default: 0 },
    efectivoContadoQ: { type: Number },
    diferenciaQ: { type: Number },
    fechaCierre: { type: String },
    horaCierre: { type: String },
    observacionesCierre: { type: String },
    usuarioCierreId: { type: String },
    cerradoPor: { type: String },
    movimientos: [CashMovementSchema],
  },
  { timestamps: true }
);

export const CashRegisterModel =
  mongoose.models.CashRegister || mongoose.model<ICashRegister>('CashRegister', CashRegisterSchema);
