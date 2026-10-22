import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    id: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, default: '' },
    asunto: { type: String, required: true },
    mensaje: { type: String, required: true },
    fecha: { type: String, required: true },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
