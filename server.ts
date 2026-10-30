import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/config/db';
import { Repository } from './server/data/repository';

import { authRouter } from './server/routes/authRoutes';
import { userRouter } from './server/routes/userRoutes';
import { patientRouter } from './server/routes/patientRoutes';
import { guardianRouter } from './server/routes/guardianRoutes';
import { serviceRouter } from './server/routes/serviceRoutes';
import { appointmentRouter } from './server/routes/appointmentRoutes';
import { requestRouter } from './server/routes/requestRoutes';
import { materialRouter } from './server/routes/materialRoutes';
import { paymentRouter } from './server/routes/paymentRoutes';
import { cashRouter } from './server/routes/cashRoutes';
import { contentRouter, scheduleRouter } from './server/routes/contentRoutes';
import { contactRouter } from './server/routes/contactRoutes';
import { reportRouter } from './server/routes/reportRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe definirse en .env con al menos 32 caracteres.');
  }
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // MongoDB is required for persistent operation
  await connectDB();
  await Repository.trySyncToMongo();

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/usuarios', userRouter);
  app.use('/api/pacientes', patientRouter);
  app.use('/api/responsables', guardianRouter);
  app.use('/api/servicios', serviceRouter);
  app.use('/api/citas', appointmentRouter);
  app.use('/api/solicitudes-cita', requestRouter);
  app.use('/api/materiales', materialRouter);
  app.use('/api/pagos', paymentRouter);
  app.use('/api/cajas', cashRouter);
  app.use('/api/contenido', contentRouter);
  app.use('/api/horarios', scheduleRouter);
  app.use('/api/contacto', contactRouter);
  app.use('/api/reportes', reportRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SIGCA - Centro Armonía API',
      timestamp: new Date().toISOString(),
    });
  });

  // Any unknown API route must return JSON 404 (never the SPA HTML).
  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, message: 'Recurso de API no encontrado' });
  });

  // Frontend Serving (SPA integration)
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In development: mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve static build. Express 5 rejects app.get('*'),
    // so the SPA fallback uses a plain middleware instead.
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SIGCA Server] Servidor iniciado en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SIGCA Server] Error al iniciar el servidor:', err);
  process.exitCode = 1;
});
