import mongoose, { Schema, Document } from 'mongoose';

export interface IInstitutionalContent extends Document {
  id: string;
  centroNombre: string;
  logoUrl: string;
  slogan: string;
  telefonoPBX: string;
  whatsapp: string;
  emailContacto: string;
  mision: string;
  vision: string;
  horariosSemana: string;
  horariosSabado: string;
  sedes: Array<{
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  }>;
  posts: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    fechaPublicacion: string;
    imagenUrl: string;
    categoria: string;
    enlace?: string;
  }>;
  actividades: Array<{
    id: string;
    titulo: string;
    tipo: 'Capacitación' | 'Escuela para Padres' | 'Taller Institucional';
    descripcion: string;
    imagenUrl: string;
    fecha?: string;
  }>;
}

const ContentSchema = new Schema<IInstitutionalContent>(
  {
    id: { type: String, required: true, unique: true, default: 'main-content' },
    centroNombre: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    slogan: { type: String, default: '' },
    telefonoPBX: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    emailContacto: { type: String, default: '' },
    mision: { type: String, required: true },
    vision: { type: String, required: true },
    horariosSemana: { type: String, default: 'Lunes a Viernes: 8:00 AM - 6:00 PM' },
    horariosSabado: { type: String, default: 'Sábados: 8:00 AM - 1:00 PM' },
    sedes: [
      {
        id: String,
        nombre: String,
        direccion: String,
        telefono: String,
      },
    ],
    posts: [
      {
        id: String,
        titulo: String,
        descripcion: String,
        fechaPublicacion: String,
        imagenUrl: String,
        categoria: String,
        enlace: String,
      },
    ],
    actividades: [
      {
        id: String,
        titulo: String,
        tipo: String,
        descripcion: String,
        imagenUrl: String,
        fecha: String,
      },
    ],
  },
  { timestamps: true }
);

export const ContentModel =
  mongoose.models.Content || mongoose.model<IInstitutionalContent>('Content', ContentSchema);
