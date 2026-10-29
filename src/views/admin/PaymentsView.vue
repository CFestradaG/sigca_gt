<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';
import { PaymentMethod } from '../../types';
import PrintableVoucherModal from '../../components/admin/PrintableVoucherModal.vue';

const store = useAppStore();
const router = useRouter();

const searchTerm = ref('');
const showAddPaymentModal = ref(false);
const paymentError = ref('');
const isSavingPayment = ref(false);
const annulError = ref('');
const annulSuccess = ref('');

const formData = ref({
  pacienteId: store.patients[0]?.id || '',
  citaId: '',
  montoQ: 350.00,
  metodoPago: 'EFECTIVO' as PaymentMethod,
  concepto: 'Pago de sesión terapéutica',
  notas: '',
});

const selectedPatient = computed(() => {
  return store.patients.find((p) => p.id === formData.value.pacienteId) || store.patients[0];
});

const selectedPatientBalance = computed(() => {
  return selectedPatient.value ? store.getPatientBalance(selectedPatient.value.id) : { totalCharged: 0, totalPaid: 0, balance: 0 };
});

const payableAppointments = computed(() => store.getPatientAppointments(formData.value.pacienteId)
  .filter((apt) => apt.estado !== 'CANCELADA')
  .map((apt) => ({ ...apt, balance: Math.max(0, apt.precioQ - store.payments
    .filter((payment) => payment.citaId === apt.id && (payment as any).estado !== 'ANULADO')
    .reduce((sum, payment) => sum + payment.montoQ, 0)) }))
  .filter((apt) => apt.balance > 0));

const selectedAppointment = computed(() => payableAppointments.value.find((apt) => apt.id === formData.value.citaId));

const handleOpenAdd = () => {
  formData.value = {
    pacienteId: store.patients[0]?.id || '',
    citaId: '',
    montoQ: 350.00,
    metodoPago: 'EFECTIVO',
    concepto: 'Pago de sesión terapéutica',
    notas: '',
  };
  formData.value.citaId = payableAppointments.value[0]?.id || '';
  formData.value.montoQ = payableAppointments.value[0]?.balance || 0;
  paymentError.value = '';
  showAddPaymentModal.value = true;
};

const handleSubmit = async () => {
  paymentError.value = '';
  if (!formData.value.citaId || formData.value.montoQ <= 0) {
    paymentError.value = 'Selecciona una cita con saldo pendiente e indica un monto mayor a cero.';
    return;
  }
  isSavingPayment.value = true;
  try {
    const created = await store.registerPayment({
      citaId: formData.value.citaId,
      montoQ: Number(formData.value.montoQ),
      metodoPago: formData.value.metodoPago,
      concepto: formData.value.concepto.trim(),
      notas: formData.value.notas.trim(),
    });
    showAddPaymentModal.value = false;
    store.setSelectedPaymentForPrint(created);
  } catch (err: any) {
    paymentError.value = err?.message || 'No se pudo registrar el pago.';
  } finally {
    isSavingPayment.value = false;
  }
};

const filteredPayments = computed(() => {
  return store.payments
    .filter((p) => {
      const patient = store.patients.find((pt) => pt.id === p.pacienteId);
      const query = searchTerm.value.toLowerCase();
      return (
        p.numeroComprobante.toLowerCase().includes(query) ||
        p.concepto.toLowerCase().includes(query) ||
        (patient && `${patient.nombres} ${patient.apellidos}`.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
});

const totalCollectedAll = computed(() => {
  // RN-19: los comprobantes anulados no forman parte de la recaudación.
  return store.payments
    .filter((p: any) => p.estado !== 'ANULADO')
    .reduce((sum, p) => sum + p.montoQ, 0);
});

const handleAnnul = async (payment: any) => {
  annulError.value = '';
  annulSuccess.value = '';
  const motivo = window.prompt('Motivo de la anulación (mínimo 5 caracteres):');
  if (!motivo) return;
  try {
    await store.annulPayment(payment.id, motivo.trim());
    annulSuccess.value = `Comprobante ${payment.numeroComprobante} anulado correctamente.`;
  } catch (err: any) {
    annulError.value = err?.message || 'No se pudo anular el pago.';
  }
};

const totalPendingBalanceAll = computed(() => {
  return store.patients.reduce((sum, p) => sum + store.getPatientBalance(p.id).balance, 0);
});

const goToPatient = (patientId: string) => {
  store.setSelectedPatientId(patientId);
  router.push('/admin/pacientes');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Gestión de Pagos y Saldos Pendientes
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Registro de abonos, pagos completos, cálculo de saldos y emisión de comprobantes internos.
        </p>
      </div>

      <button
        @click="handleOpenAdd"
        class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
      >
        <span class="material-symbols-outlined text-base">payments</span>
        <span>Registrar Nuevo Pago (Q)</span>
      </button>
    </div>

    <div v-if="annulSuccess" role="status" class="p-3 rounded-xl bg-[#e0f5ee] text-[#00685d] text-xs font-semibold">
      {{ annulSuccess }}
    </div>
    <div v-if="annulError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">
      {{ annulError }}
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">Recaudación Acumulada</span>
        <h3 class="text-2xl font-extrabold text-[#00685d]">
          Q {{ totalCollectedAll.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#3d4947]">{{ store.payments.length }} recibos emitidos</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">Saldos Pendientes Totales</span>
        <h3 class="text-2xl font-extrabold text-[#a33d23]">
          Q {{ totalPendingBalanceAll.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#3d4947]">Calculado en base a citas realizadas vs pagos</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">Métodos Aceptados</span>
        <p class="text-sm font-bold text-[#1d1c16]">Efectivo • Tarjeta POS • Transferencia</p>
        <p class="text-[11px] text-[#00685d] font-semibold">Integrado con Caja Diaria</p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-[#e7e2d9] shadow-xs flex items-center justify-between gap-4">
      <div class="relative w-full max-w-sm">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6d7a77]">
          search
        </span>
        <input
          type="search"
          placeholder="Buscar por comprobante, paciente o concepto..."
          v-model="searchTerm"
          class="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8f3ea] border border-[#bcc9c6] text-xs text-[#1d1c16] focus:outline-none focus:ring-2 focus:ring-[#00685d]"
        />
      </div>
    </div>

    <!-- Payments Table -->
    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#f8f3ea] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
            <tr>
              <th class="py-3 px-4">Comprobante / Fecha</th>
              <th class="py-3 px-4">Paciente</th>
              <th class="py-3 px-4">Concepto del Pago</th>
              <th class="py-3 px-4">Método</th>
              <th class="py-3 px-4">Monto (Q)</th>
              <th class="py-3 px-4">Receptor</th>
              <th class="py-3 px-4 text-right">Comprobante</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#ece8df]">
            <tr v-if="filteredPayments.length === 0">
              <td colspan="7" class="py-8 text-center text-[#6d7a77]">
                No se encontraron pagos registrados.
              </td>
            </tr>
            <tr
              v-for="p in filteredPayments"
              :key="p.id"
              class="hover:bg-[#fef9f0] transition-colors"
            >
              <td class="py-3.5 px-4">
                <span class="font-mono font-bold text-[#00685d] block">
                  {{ p.numeroComprobante }}
                </span>
                <span class="text-[11px] text-[#6d7a77]">{{ p.fecha }}</span>
              </td>

              <td class="py-3.5 px-4">
                <button
                  @click="goToPatient(p.pacienteId)"
                  class="font-heading font-bold text-sm text-[#1d1c16] hover:text-[#00685d] text-left cursor-pointer"
                >
                  {{ store.patients.find((pt) => pt.id === p.pacienteId)?.nombres }}
                  {{ store.patients.find((pt) => pt.id === p.pacienteId)?.apellidos }}
                </button>
                <span class="block text-[11px] text-[#6d7a77]">{{ p.pacienteId }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="font-semibold text-[#1d1c16] block">{{ p.concepto }}</span>
                <span v-if="p.notas" class="text-[11px] text-[#6d7a77] italic">{{ p.notas }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-full bg-[#f2ede4] font-bold text-[10px] text-[#3d4947]">
                  {{ p.metodoPago }}
                </span>
              </td>

              <td class="py-3.5 px-4">
                <span class="font-extrabold text-sm" :class="(p as any).estado === 'ANULADO' ? 'text-[#6d7a77] line-through' : 'text-[#00685d]'">
                  Q {{ p.montoQ.toFixed(2) }}
                </span>
                <span
                  v-if="(p as any).estado === 'ANULADO'"
                  class="block text-[10px] font-bold text-[#ba1a1a]"
                >ANULADO</span>
              </td>

              <td class="py-3.5 px-4 text-[#3d4947]">
                {{ p.atendidoPor }}
              </td>

              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="(p as any).estado !== 'ANULADO'"
                    @click="handleAnnul(p)"
                    class="px-2.5 py-1.5 bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Anular pago con motivo justificado"
                  >
                    <span class="material-symbols-outlined text-sm">block</span>
                    <span>Anular</span>
                  </button>
                  <button
                    @click="store.setSelectedPaymentForPrint(p)"
                    class="px-2.5 py-1.5 bg-white hover:bg-[#ece8df] border border-[#bcc9c6] text-[#00685d] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-sm">print</span>
                    <span>Imprimir</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Payment Modal -->
    <div v-if="showAddPaymentModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6]">
        <div class="flex justify-between items-center border-b border-[#ece8df] pb-3">
          <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
            Registrar Pago de Paciente
          </h3>
          <button @click="showAddPaymentModal = false" class="text-[#6d7a77]">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Paciente *</label>
            <select
              v-model="formData.pacienteId"
              @change="formData.citaId = payableAppointments[0]?.id || ''; formData.montoQ = payableAppointments[0]?.balance || 0"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
            >
              <option
                v-for="p in store.patients"
                :key="p.id"
                :value="p.id"
              >
                {{ p.nombres }} {{ p.apellidos }} (Saldo: Q {{ store.getPatientBalance(p.id).balance.toFixed(2) }})
              </option>
            </select>
            <div class="p-2.5 bg-[#f8f3ea] rounded-xl border border-[#ece8df] mt-2 flex justify-between text-[11px]">
              <span class="text-[#6d7a77]">Saldo pendiente actual:</span>
              <strong :class="selectedPatientBalance.balance > 0 ? 'text-[#a33d23]' : 'text-[#00685d]'">
                Q {{ selectedPatientBalance.balance.toFixed(2) }}
              </strong>
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Cita a pagar *</label>
            <select v-model="formData.citaId" required @change="formData.montoQ = selectedAppointment?.balance || 0" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white">
              <option value="" disabled>Selecciona una cita con saldo</option>
              <option v-for="apt in payableAppointments" :key="apt.id" :value="apt.id">
                {{ apt.fecha }} {{ apt.horaInicio }} · {{ store.services.find((s) => s.id === apt.servicioId)?.nombre }} · Saldo Q {{ apt.balance.toFixed(2) }}
              </option>
            </select>
            <p v-if="!payableAppointments.length" class="mt-1 text-[11px] text-[#a33d23]">Este paciente no tiene citas con saldo pendiente.</p>
          </div>

          <div v-if="paymentError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04]">{{ paymentError }}</div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Monto en Quetzales (Q) *</label>
            <input
              type="number"
              required
              step="0.01"
              min="1"
              :max="selectedAppointment?.balance || undefined"
              v-model="formData.montoQ"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs text-base font-bold text-[#00685d]"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Método de Pago *</label>
            <select
              v-model="formData.metodoPago"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
            >
              <option value="EFECTIVO">Efectivo en Caja</option>
              <option value="TARJETA">Tarjeta de Débito / Crédito (POS)</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria (BAM / BI / G&T)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Concepto del Pago *</label>
            <input
              type="text"
              required
              placeholder="Ej. Pago total por sesión de Estimulación Auditivo-Verbal"
              v-model="formData.concepto"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Notas Administrativas / Referencia</label>
            <input
              type="text"
              placeholder="Ej. Cobrado con terminal Visanet aut. #9210"
              v-model="formData.notas"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button
              type="button"
              @click="showAddPaymentModal = false"
              class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSavingPayment || !payableAppointments.length"
              class="px-5 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {{ isSavingPayment ? 'Registrando…' : 'Confirmar Cobro y Emitir' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Printable Voucher Modal -->
    <PrintableVoucherModal
      v-if="store.selectedPaymentForPrint"
      :payment="store.selectedPaymentForPrint"
      @close="store.setSelectedPaymentForPrint(null)"
    />
  </div>
</template>
