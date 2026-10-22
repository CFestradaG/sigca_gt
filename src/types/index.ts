export type UserRole = 'ADMIN' | 'RECEPCION' | 'PROFESIONAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  phone?: string;
  specialty?: string;
  avatarUrl?: string;
}

export interface Patient {
  id: string;
  photoUrl: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: 'M' | 'F' | 'Otro';
  telefono: string;
  direccion: string;
  fechaInicio: string;
  observaciones: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Guardian {
  id: string;
  photoUrl: string;
  nombres: string;
  apellidos: string;
  parentesco: string; // 'Madre' | 'Padre' | 'Tutor Legal' | 'Abuela' etc.
  telefono: string;
  email: string;
  direccion: string;
  patientIds: string[];
}

export interface ClinicalService {
  id: string;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  precioQ: number;
  imagenUrl: string;
  estado: 'ACTIVO' | 'INACTIVO';
  categoria: 'Psicología' | 'Estimulación Auditiva' | 'Lenguaje' | 'Evaluación Integral';
}

export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

export interface Appointment {
  id: string;
  pacienteId: string;
  servicioId: string;
  profesionalId: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  precioQ: number;
  estado: AppointmentStatus;
  observaciones: string;
  sede: string;
  fechaCreacion: string;
}

export type RequestStatus = 'PENDIENTE' | 'ATENDIDA' | 'RECHAZADA';

export interface AppointmentRequest {
  id: string;
  solicitanteNombre: string;
  email: string;
  telefono: string;
  servicioId: string;
  fechaPreferida: string;
  sedePreferida: string;
  mensaje: string;
  estado: RequestStatus;
  fechaCreacion: string;
  citaGeneradaId?: string;
}

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

export interface Payment {
  id: string;
  citaId?: string;
  pacienteId: string;
  montoQ: number;
  metodoPago: PaymentMethod;
  numeroComprobante: string;
  fecha: string; // YYYY-MM-DD HH:mm
  concepto: string;
  notas?: string;
  atendidoPor: string;
  estado?: 'REGISTRADO' | 'ANULADO';
  motivoAnulacion?: string;
}

export interface CashMovement {
  id: string;
  tipo: 'INGRESO' | 'EGRESO';
  montoQ: number;
  concepto: string;
  hora: string;
  metodoPago: PaymentMethod;
  comprobanteRef?: string;
}

export interface DailyCashRegister {
  id: string;
  usuarioId?: string;
  fecha: string; // YYYY-MM-DD
  fechaApertura?: string;
  estado: 'ABIERTA' | 'CERRADA';
  montoInicialQ: number;
  montoFinalQ?: number;
  usuarioNombre: string;
  horaApertura: string;
  totalEfectivoQ?: number;
  totalTransferenciasQ?: number;
  totalTarjetaQ?: number;
  totalIngresosQ?: number;
  efectivoEsperadoQ?: number;
  efectivoContadoQ?: number;
  diferenciaQ?: number;
  fechaCierre?: string;
  horaCierre?: string;
  observacionesCierre?: string;
  usuarioCierreId?: string;
  cerradoPor?: string;
  movimientos: CashMovement[];
}

export interface EducationalMaterial {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'GUIA' | 'FICHA' | 'AUDIO' | 'EJERCICIO' | 'VIDEO';
  enlaceRecurso: string;
  fechaRegistro: string;
  estado: 'ACTIVO' | 'INACTIVO';
  assignedPatientIds: string[];
}

export interface EducationalPost {
  id: string;
  titulo: string;
  descripcion: string;
  fechaPublicacion: string;
  imagenUrl: string;
  categoria: string;
  enlace?: string;
}

export interface CorporateActivity {
  id: string;
  titulo: string;
  tipo: 'Capacitación' | 'Escuela para Padres' | 'Taller Institucional';
  descripcion: string;
  imagenUrl: string;
  fecha?: string;
}

export interface ContactMessage {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export interface InstitutionalContent {
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
  sedes: {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
  }[];
  posts: EducationalPost[];
  actividades: CorporateActivity[];
}
