<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const showOpenModal = ref(false);
const showCloseModal = ref(false);
const initialCashInput = ref(500);
const countedInput = ref(0);
const openError = ref('');
const closeError = ref('');
const closeSuccess = ref('');
const isOpening = ref(false);
const isClosing = ref(false);

const isOpened = computed(() => store.cashRegister.estado === 'ABIERTA');

const totalCashIngresos = computed(() => {
  const fromServer = store.cashRegister.totalEfectivoQ;
  if (typeof fromServer === 'number') return fromServer;
  return store.cashRegister.movimientos
    .filter((m) => m.tipo === 'INGRESO' && m.metodoPago === 'EFECTIVO')
    .reduce((sum, m) => sum + m.montoQ, 0);
});

const totalOtherIngresos = computed(() => {
  const transfers = store.cashRegister.totalTransferenciasQ;
  const cards = store.cashRegister.totalTarjetaQ;
  if (typeof transfers === 'number' || typeof cards === 'number') {
    return (transfers || 0) + (cards || 0);
  }
  return store.cashRegister.movimientos
    .filter((m) => m.tipo === 'INGRESO' && m.metodoPago !== 'EFECTIVO')
    .reduce((sum, m) => sum + m.montoQ, 0);
});

const totalCashEgresos = computed(() => {
  return store.cashRegister.movimientos
    .filter((m) => m.tipo === 'EGRESO' && m.metodoPago === 'EFECTIVO')
    .reduce((sum, m) => sum + m.montoQ, 0);
});

// Efectivo esperado según el servidor (monto inicial + cobros válidos en efectivo).
const expectedCash = computed(() => {
  const fromServer = store.cashRegister.efectivoEsperadoQ;
  if (typeof fromServer === 'number') return fromServer;
  return store.cashRegister.montoInicialQ + totalCashIngresos.value;
});

const currentCashInDrawer = computed(() => {
  if (isOpened.value) return expectedCash.value;
  return store.cashRegister.efectivoContadoQ ?? store.cashRegister.montoFinalQ ?? 0;
});

const hasArqueo = computed(() => typeof store.cashRegister.efectivoContadoQ === 'number');
const difference = computed(() => store.cashRegister.diferenciaQ ?? 0);
const previewDifference = computed(() => Number(countedInput.value || 0) - expectedCash.value);

const openCloseModal = () => {
  countedInput.value = Number(expectedCash.value.toFixed(2));
  closeError.value = '';
  closeSuccess.value = '';
  showCloseModal.value = true;
};

const handleOpenRegister = async () => {
  openError.value = '';
  isOpening.value = true;
  try {
    await store.openCashRegister(Number(initialCashInput.value));
    showOpenModal.value = false;
    await store.fetchCashRegisters();
  } catch (err: any) {
    openError.value = err?.message || 'No se pudo abrir la caja.';
  } finally {
    isOpening.value = false;
  }
};

const handleCloseRegister = async () => {
  closeError.value = '';
  isClosing.value = true;
  try {
    await store.closeCashRegister(Number(countedInput.value));
    showCloseModal.value = false;
    closeSuccess.value = 'Caja cerrada correctamente. Arqueo registrado.';
    await store.fetchCashRegisters();
  } catch (err: any) {
    closeError.value = err?.message || 'No se pudo cerrar la caja.';
  } finally {
    isClosing.value = false;
  }
};

onMounted(async () => {
  await store.fetchCashRegisters();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
            Control de Caja Diaria
          </h2>
          <span
            class="px-3 py-1 rounded-full text-xs font-bold"
            :class="isOpened ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ffdad6] text-[#ba1a1a]'"
          >
            {{ store.cashRegister.estado }}
          </span>
        </div>
        <p class="text-xs text-[#6d7a77]">
          Fecha: {{ store.cashRegister.fecha }} • Responsable: {{ store.cashRegister.usuarioNombre }} • Apertura: {{ store.cashRegister.horaApertura }}
        </p>
      </div>

      <div class="flex gap-2">
        <template v-if="isOpened">
          <button
            @click="openCloseModal"
            class="px-4 py-2.5 bg-[#a33d23] hover:bg-[#83260e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">lock</span>
            <span>Cerrar Caja Diaria</span>
          </button>
        </template>
        <button
          v-else
          @click="showOpenModal = true"
          class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">lock_open</span>
          <span>Abrir Nueva Caja Diaria</span>
        </button>
      </div>
    </div>

    <div v-if="closeSuccess" role="status" class="p-3 rounded-xl bg-[#e0f5ee] text-[#00685d] text-xs font-semibold">
      {{ closeSuccess }}
    </div>
    <div v-if="openError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">
      {{ openError }}
    </div>

    <!-- Arqueo del cierre -->
    <div v-if="hasArqueo" class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs">
      <div>
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">Efectivo Esperado</span>
        <h3 class="text-xl font-extrabold text-[#1d1c16]">Q {{ expectedCash.toFixed(2) }}</h3>
      </div>
      <div>
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">Efectivo Contado</span>
        <h3 class="text-xl font-extrabold text-[#1d1c16]">Q {{ (store.cashRegister.efectivoContadoQ || 0).toFixed(2) }}</h3>
      </div>
      <div>
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">Diferencia</span>
        <h3 class="text-xl font-extrabold" :class="difference === 0 ? 'text-[#00685d]' : 'text-[#a33d23]'">
          Q {{ difference.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#6d7a77]">
          Cerrada por: {{ store.cashRegister.cerradoPor || store.cashRegister.usuarioNombre }}
        </p>
      </div>
    </div>

    <!-- Cash Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">
          Efectivo Actual en Gaveta
        </span>
        <h3 class="text-2xl font-extrabold text-[#00685d]">
          Q {{ currentCashInDrawer.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#3d4947]">Base inicial: Q {{ store.cashRegister.montoInicialQ.toFixed(2) }}</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">
          Ingresos en Efectivo
        </span>
        <h3 class="text-2xl font-extrabold text-[#00685d]">
          +Q {{ totalCashIngresos.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#3d4947]">Cobros directos en ventanilla</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">
          Egresos / Gastos Menores
        </span>
        <h3 class="text-2xl font-extrabold text-[#a33d23]">
          -Q {{ totalCashEgresos.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#3d4947]">Compras y suministros de emergencia</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-1">
        <span class="text-[11px] font-bold text-[#6d7a77] uppercase">
          Ventas Tarjeta / POS & Transfer
        </span>
        <h3 class="text-2xl font-extrabold text-[#455f73]">
          Q {{ totalOtherIngresos.toFixed(2) }}
        </h3>
        <p class="text-[11px] text-[#3d4947]">Liquidación electrónica bancaria</p>
      </div>
    </div>

    <!-- Movements Table -->
    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden space-y-0">
      <div class="p-4 bg-[#f8f3ea] border-b border-[#ece8df] flex justify-between items-center">
        <h3 class="font-heading font-bold text-sm text-[#1d1c16]">
          Movimientos y Arqueo de la Jornada
        </h3>
        <span class="text-xs text-[#6d7a77]">
          {{ store.cashRegister.movimientos.length }} movimientos registrados
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#fef9f0] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
            <tr>
              <th class="py-3 px-4">Hora</th>
              <th class="py-3 px-4">Tipo</th>
              <th class="py-3 px-4">Concepto / Justificación</th>
              <th class="py-3 px-4">Método</th>
              <th class="py-3 px-4">Comprobante Ref.</th>
              <th class="py-3 px-4 text-right">Monto (Q)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#ece8df]">
            <tr v-if="store.cashRegister.movimientos.length === 0">
              <td colspan="6" class="py-8 text-center text-[#6d7a77]">
                No se han registrado movimientos en esta caja aún.
              </td>
            </tr>
            <tr
              v-for="mov in store.cashRegister.movimientos"
              :key="mov.id"
              class="hover:bg-[#fef9f0] transition-colors"
            >
              <td class="py-3.5 px-4 font-mono font-bold text-[#3d4947]">
                {{ mov.hora }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="mov.tipo === 'INGRESO' ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ffdad6] text-[#ba1a1a]'"
                >
                  {{ mov.tipo }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-semibold text-[#1d1c16]">
                {{ mov.concepto }}
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-full bg-[#f2ede4] font-bold text-[10px] text-[#3d4947]">
                  {{ mov.metodoPago }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-mono text-[#6d7a77]">
                {{ mov.comprobanteRef || '—' }}
              </td>
              <td
                class="py-3.5 px-4 text-right font-extrabold text-sm"
                :class="mov.tipo === 'INGRESO' ? 'text-[#00685d]' : 'text-[#ba1a1a]'"
              >
                {{ mov.tipo === 'INGRESO' ? '+' : '-' }} Q {{ mov.montoQ.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Historial de cierres (RF-11.11) -->
    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden">
      <div class="p-4 bg-[#f8f3ea] border-b border-[#ece8df]">
        <h3 class="font-heading font-bold text-sm text-[#1d1c16]">Cierres y cajas anteriores</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#fef9f0] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
            <tr>
              <th class="py-3 px-4">Fecha / Responsable</th>
              <th class="py-3 px-4">Apertura</th>
              <th class="py-3 px-4 text-right">Monto Inicial</th>
              <th class="py-3 px-4 text-right">Ingresos</th>
              <th class="py-3 px-4 text-right">Esperado</th>
              <th class="py-3 px-4 text-right">Contado</th>
              <th class="py-3 px-4 text-right">Diferencia</th>
              <th class="py-3 px-4">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#ece8df]">
            <tr v-if="store.allCashRegisters.length === 0">
              <td colspan="8" class="py-6 text-center text-[#6d7a77]">No hay cajas registradas.</td>
            </tr>
            <tr v-for="caja in store.allCashRegisters" :key="caja.id" class="hover:bg-[#fef9f0]">
              <td class="py-3 px-4">
                <span class="font-bold text-[#1d1c16] block">{{ caja.fecha }}</span>
                <span class="text-[11px] text-[#6d7a77]">{{ caja.cerradoPor || caja.usuarioNombre }}</span>
              </td>
              <td class="py-3 px-4 text-[#3d4947]">{{ caja.fechaApertura || caja.horaApertura }}</td>
              <td class="py-3 px-4 text-right font-semibold">Q {{ (caja.montoInicialQ || 0).toFixed(2) }}</td>
              <td class="py-3 px-4 text-right font-semibold">Q {{ (caja.totalIngresosQ || 0).toFixed(2) }}</td>
              <td class="py-3 px-4 text-right font-semibold">Q {{ (caja.efectivoEsperadoQ || 0).toFixed(2) }}</td>
              <td class="py-3 px-4 text-right font-semibold">
                {{ typeof caja.efectivoContadoQ === 'number' ? `Q ${caja.efectivoContadoQ.toFixed(2)}` : '—' }}
              </td>
              <td class="py-3 px-4 text-right font-extrabold" :class="(caja.diferenciaQ || 0) === 0 ? 'text-[#00685d]' : 'text-[#a33d23]'">
                {{ typeof caja.diferenciaQ === 'number' ? `Q ${caja.diferenciaQ.toFixed(2)}` : '—' }}
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="caja.estado === 'ABIERTA' ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ece8df] text-[#3d4947]'">
                  {{ caja.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Open Cash Register Modal -->
    <div v-if="showOpenModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          Apertura de Caja Diaria
        </h3>
        <p class="text-xs text-[#3d4947]">
          Ingrese el fondo de caja inicial en efectivo (cambio y monedas) para iniciar la jornada.
        </p>

        <div v-if="openError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">
          {{ openError }}
        </div>

        <form @submit.prevent="handleOpenRegister" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">
              Monto Inicial en Efectivo (Q) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              v-model="initialCashInput"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-base font-bold text-[#00685d]"
            />
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button
              type="button"
              @click="showOpenModal = false"
              class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isOpening"
              class="px-5 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {{ isOpening ? 'Abriendo…' : 'Confirmar Apertura' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Close Cash Register Modal (efectivo contado + arqueo) -->
    <div v-if="showCloseModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          Cierre y Arqueo de Caja
        </h3>
        <p class="text-xs text-[#3d4947]">
          Efectivo esperado en gaveta: <strong class="text-[#00685d]">Q {{ expectedCash.toFixed(2) }}</strong>
          (monto inicial + cobros válidos en efectivo).
        </p>

        <form @submit.prevent="handleCloseRegister" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">
              Efectivo contado al cierre (Q) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              v-model="countedInput"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-base font-bold text-[#00685d]"
            />
          </div>

          <div class="p-3 rounded-xl bg-[#f8f3ea] border border-[#ece8df] flex items-center justify-between">
            <span class="font-bold text-[#3d4947]">Diferencia preliminar</span>
            <span class="font-extrabold" :class="previewDifference === 0 ? 'text-[#00685d]' : 'text-[#a33d23]'">
              Q {{ previewDifference.toFixed(2) }}
            </span>
          </div>

          <div v-if="closeError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04]">
            {{ closeError }}
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button
              type="button"
              @click="showCloseModal = false"
              class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isClosing"
              class="px-5 py-2 bg-[#a33d23] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {{ isClosing ? 'Cerrando…' : 'Confirmar Cierre' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
