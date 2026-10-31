<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { Payment } from '../../types';

const props = defineProps<{
  payment: Payment;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useAppStore();

const patient = computed(() => {
  return store.patients.find((p) => p.id === props.payment.pacienteId);
});

const handlePrint = () => {
  window.print();
};
</script>

<template>
  <div class="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-[#bcc9c6] space-y-6 my-auto">
      <!-- Actions Bar (Not printed) -->
      <div class="flex justify-between items-center print:hidden border-b border-[#ece8df] pb-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#00685d]">receipt_long</span>
          <span class="font-heading font-bold text-base text-[#1d1c16]">
            Vista Previa de Comprobante Interno
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="handlePrint"
            class="px-4 py-2 bg-[#00685d] hover:bg-[#008376] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">print</span>
            <span>Imprimir Comprobante</span>
          </button>
          <button
            @click="emit('close')"
            class="p-2 text-[#6d7a77] hover:bg-[#ece8df] rounded-xl cursor-pointer"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      <!-- PRINTABLE VOUCHER CONTENT -->
      <div id="printable-voucher" class="p-6 sm:p-8 bg-white border-2 border-[#1d1c16] rounded-2xl space-y-6 text-[#1d1c16]">
        <!-- Header -->
        <div class="flex justify-between items-start border-b-2 border-[#1d1c16] pb-4">
          <div>
            <h2 class="font-heading font-extrabold text-2xl text-[#00685d]">
              {{ store.content.centroNombre }}
            </h2>
            <p class="text-xs font-bold uppercase tracking-wider text-[#3d4947]">
              Psicología & Estimulación Auditivo-Verbal
            </p>
            <p class="text-[11px] text-[#6d7a77] mt-0.5">
              Zona 10 Sixtino II • PBX: {{ store.content.telefonoPBX }} • Ciudad de Guatemala
            </p>
          </div>

          <div class="text-right border-2 border-[#a33d23] p-2.5 rounded-xl bg-[#ffdad2]/30">
            <span class="text-[10px] font-bold uppercase tracking-widest text-[#a33d23] block">
              Comprobante de Caja
            </span>
            <span class="font-mono font-extrabold text-lg text-[#1d1c16]">
              {{ payment.numeroComprobante }}
            </span>
            <span class="text-[11px] block text-[#6d7a77] font-semibold">{{ payment.fecha }}</span>
          </div>
        </div>

        <!-- Patient Details -->
        <div class="grid grid-cols-2 gap-4 text-xs bg-[#f8f3ea] p-4 rounded-xl border border-[#ece8df]">
          <div>
            <span class="text-[#6d7a77] block font-bold uppercase text-[10px]">Paciente:</span>
            <span class="font-bold text-sm text-[#1d1c16]">
              {{ patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente' }}
            </span>
            <span class="block text-[11px] font-mono text-[#6d7a77]">{{ patient?.id }}</span>
          </div>
          <div>
            <span class="text-[#6d7a77] block font-bold uppercase text-[10px]">Método de Pago:</span>
            <span class="font-bold text-sm text-[#00685d]">{{ payment.metodoPago }}</span>
            <span class="block text-[11px] text-[#6d7a77]">Atendido por: {{ payment.atendidoPor }}</span>
          </div>
        </div>

        <!-- Itemized Table -->
        <div class="space-y-2">
          <table class="w-full text-xs">
            <thead class="border-b border-[#1d1c16] text-[#6d7a77] font-bold">
              <tr>
                <th class="py-2 text-left">Descripción del Concepto</th>
                <th class="py-2 text-right">Monto Pagado (Q)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#ece8df]">
              <tr>
                <td class="py-3 font-semibold text-[#1d1c16]">
                  {{ payment.concepto }}
                  <span v-if="payment.notas" class="block text-[11px] text-[#6d7a77] font-normal italic">{{ payment.notas }}</span>
                </td>
                <td class="py-3 text-right font-extrabold text-base text-[#1d1c16]">
                  Q {{ payment.montoQ.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total Box -->
        <div class="p-4 bg-[#f2ede4] rounded-xl flex justify-between items-center border border-[#bcc9c6]">
          <div>
            <span class="text-xs font-bold uppercase text-[#3d4947]">Total Recibido en Quetzales:</span>
            <p class="text-[11px] text-[#6d7a77]">Documento de control interno de caja y recepción</p>
          </div>
          <span class="font-extrabold text-2xl text-[#00685d]">
            Q {{ payment.montoQ.toFixed(2) }}
          </span>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div class="border-t border-[#1d1c16] pt-2">
            <span class="block font-bold">{{ payment.atendidoPor }}</span>
            <span class="text-[11px] text-[#6d7a77]">Recepción / Caja Emisora</span>
          </div>
          <div class="border-t border-[#1d1c16] pt-2">
            <span class="block font-bold">Firma de Conformidad</span>
            <span class="text-[11px] text-[#6d7a77]">Paciente o Tutor Legal</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
