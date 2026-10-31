import 'dotenv/config';
import mongoose from 'mongoose';
import {
  SEED_USERS,
  SEED_SERVICES,
  SEED_PATIENTS,
  SEED_GUARDIANS,
  SEED_APPOINTMENTS,
  SEED_MATERIALS,
  SEED_REQUESTS,
  SEED_CASH_REGISTERS,
  SEED_PAYMENTS,
  SEED_SCHEDULES,
  SEED_CONTENT,
  SEED_MESSAGES,
} from '../server/data/initialData';
import { UserModel } from '../server/models/User';
import { PatientModel } from '../server/models/Patient';
import { GuardianModel } from '../server/models/Guardian';
import { ServiceModel } from '../server/models/Service';
import { AppointmentModel } from '../server/models/Appointment';
import { RequestModel } from '../server/models/Request';
import { MaterialModel } from '../server/models/Material';
import { PaymentModel } from '../server/models/Payment';
import { CashRegisterModel } from '../server/models/CashRegister';
import { ScheduleModel } from '../server/models/Schedule';
import { ContactMessageModel } from '../server/models/ContactMessage';
import { ContentModel } from '../server/models/Content';
import { CounterModel } from '../server/models/Counter';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sigca_armonia';

async function seed() {
  console.log('[Seed] Conectando a MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Conexión establecida.');

    if (process.env.SEED_RESET === 'true') {
      console.warn('[Seed] SEED_RESET=true: eliminando los datos existentes.');
      await Promise.all([
        UserModel.deleteMany({}), PatientModel.deleteMany({}), GuardianModel.deleteMany({}),
        ServiceModel.deleteMany({}), AppointmentModel.deleteMany({}), RequestModel.deleteMany({}),
        MaterialModel.deleteMany({}), PaymentModel.deleteMany({}), CashRegisterModel.deleteMany({}),
        ScheduleModel.deleteMany({}), ContactMessageModel.deleteMany({}), ContentModel.deleteMany({}),
        CounterModel.deleteMany({}),
      ]);
    }

    console.log('[Seed] Insertando fixtures únicamente en colecciones vacías...');
    const seedIfEmpty = async (model: any, rows: any[]) => {
      if (await model.countDocuments() === 0 && rows.length) await model.insertMany(rows);
    };
    await seedIfEmpty(UserModel, SEED_USERS);
    await seedIfEmpty(PatientModel, SEED_PATIENTS);
    await seedIfEmpty(GuardianModel, SEED_GUARDIANS);
    await seedIfEmpty(ServiceModel, SEED_SERVICES);
    await seedIfEmpty(AppointmentModel, SEED_APPOINTMENTS);
    await seedIfEmpty(RequestModel, SEED_REQUESTS);
    await seedIfEmpty(MaterialModel, SEED_MATERIALS);
    await seedIfEmpty(PaymentModel, SEED_PAYMENTS);
    await seedIfEmpty(CashRegisterModel, SEED_CASH_REGISTERS);
    await seedIfEmpty(ScheduleModel, SEED_SCHEDULES);
    await seedIfEmpty(ContactMessageModel, SEED_MESSAGES);
    if (await ContentModel.countDocuments() === 0) await ContentModel.create(SEED_CONTENT);

    // El correlativo debe continuar después de los comprobantes sembrados.
    await CounterModel.updateOne(
      { _id: 'payment-voucher' },
      { $set: { seq: SEED_PAYMENTS.length } },
      { upsert: true },
    );

    console.log('----------------------------------------------------');
    console.log(' Datos de prueba cargados exitosamente:');
    console.log(` - Usuarios: ${SEED_USERS.length} (1 Admin, 2 Recepcionistas, 3 Profesionales)`);
    console.log(` - Pacientes: ${SEED_PATIENTS.length} (incluye menores y adultos)`);
    console.log(` - Responsables: ${SEED_GUARDIANS.length}`);
    console.log(` - Servicios: ${SEED_SERVICES.length}`);
    console.log(` - Citas: ${SEED_APPOINTMENTS.length} (Pendientes, Confirmadas, Completadas, Canceladas)`);
    console.log(` - Solicitudes de cita: ${SEED_REQUESTS.length}`);
    console.log(` - Materiales: ${SEED_MATERIALS.length}`);
    console.log(` - Pagos: ${SEED_PAYMENTS.length} (Efectivo, Transferencia, Tarjeta, Parciales, Anulados)`);
    console.log(` - Cajas: ${SEED_CASH_REGISTERS.length} (Abiertas y Cerradas con arqueo y diferencias)`);
    console.log(` - Horarios semanales configurados: ${SEED_SCHEDULES.length}`);
    console.log(` - Mensajes de contacto: ${SEED_MESSAGES.length}`);
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
  } catch (err) {
    console.error('[Seed] Error al sembrar base de datos:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
