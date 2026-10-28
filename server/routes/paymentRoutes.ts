import { Router, Response } from 'express';
import { Repository } from '../data/repository';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

export const paymentRouter = Router();

paymentRouter.use(authenticateToken);

// RF-02/RF-10: los datos financieros son solo para ADMIN y RECEPCIÓN.
paymentRouter.use(requireRole(['ADMIN', 'RECEPCION']));

// GET /api/pagos
paymentRouter.get('/', (req, res: Response) => {
  const { pacienteId, citaId, cajaId, fecha, metodoPago, estado } = req.query;
  const list = Repository.getPayments({
    pacienteId: pacienteId as string,
    citaId: citaId as string,
    cajaId: cajaId as string,
    fecha: fecha as string,
    metodoPago: metodoPago as string,
    estado: estado as string,
  });
  return res.status(200).json({ success: true, count: list.length, data: list });
});

// GET /api/pagos/:id
paymentRouter.get('/:id', (req, res: Response) => {
  const p = Repository.getPaymentById(String(req.params.id));
  if (!p) return res.status(404).json({ success: false, message: 'Comprobante de pago no encontrado' });
  return res.status(200).json({ success: true, data: p });
});

// POST /api/pagos (RN-15 to RN-21, RN-28, RN-29)
// Allowed for ADMIN and RECEPCION
paymentRouter.post('/', requireRole(['ADMIN', 'RECEPCION']), async (req: AuthRequest, res: Response) => {
  try {
    const { citaId, montoQ, metodoPago, concepto, notas } = req.body;

    if (!citaId || montoQ === undefined || !metodoPago) {
      return res.status(400).json({
        success: false,
        message: 'RN-30: La cita, el monto y el método de pago son obligatorios',
      });
    }

    if (!['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].includes(metodoPago)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido. Permitidos: EFECTIVO, TRANSFERENCIA, TARJETA',
      });
    }

    const created = await Repository.registerPayment({
      citaId,
      montoQ: Number(montoQ),
      metodoPago,
      concepto,
      notas,
      usuario: {
        id: req.user!.id,
        nombre: req.user!.nombre,
        rol: req.user!.rol,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente con comprobante correlativo',
      data: created,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// PATCH /api/pagos/:id/anular (RN-19, RN-21, RN-27, RN-29)
// Authorized annulment with justification
paymentRouter.patch('/:id/anular', requireRole(['ADMIN', 'RECEPCION']), async (req: AuthRequest, res: Response) => {
  try {
    const { motivoAnulacion } = req.body;
    if (!motivoAnulacion || motivoAnulacion.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Debe justificar la anulación con un motivo claro (mínimo 5 caracteres)',
      });
    }

    const payment = await Repository.annulPayment(String(req.params.id), motivoAnulacion, {
      id: req.user!.id,
      nombre: req.user!.nombre,
      rol: req.user!.rol,
    });

    return res.status(200).json({
      success: true,
      message: 'Comprobante de pago anulado exitosamente y ajustado en caja',
      data: payment,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// RN-26: Block physical deletion of payments
paymentRouter.delete('/:id', (_req, res: Response) => {
  return res.status(405).json({
    success: false,
    message: 'RN-26: Los pagos no pueden eliminarse físicamente; debe realizar una anulación justificada mediante PATCH /api/pagos/:id/anular',
  });
});
