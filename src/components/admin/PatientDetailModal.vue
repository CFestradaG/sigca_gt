<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { Patient } from '../../types';

const props = defineProps<{
  patientId: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'editPatient', patient: Patient): void;
}>();

const store = useAppStore();

const activeTab = ref<'resumen' | 'responsables' | 'citas' | 'pagos' | 'materiales'>('resumen');
const showAddGuardianModal = ref(false);
const showAssignMaterialModal = ref(false);

const patient = computed(() => store.patients.find((p) => p.id === props.patientId));

const age = computed(() => patient.value ? store.calculateAge(patient.value.fechaNacimiento) : { years: 0, months: 0, text: '' });
const minor = computed(() => patient.value ? store.isMinor(patient.value.fechaNacimiento) : false);
const patientGuardians = computed(() => patient.value ? store.getPatientGuardians(patient.value.id) : []);
const patientAppointments = computed(() => patient.value ? store.getPatientAppointments(patient.value.id) : []);
const patientPayments = computed(() => patient.value ? store.getPatientPayments(patient.value.id) : []);
const balance = computed(() => patient.value ? store.getPatientBalance(patient.value.id) : { totalCharged: 0, totalPaid: 0, balance: 0 });
const canSeeFinance = computed(() => store.currentUser?.role === 'ADMIN' || store.currentUser?.role === 'RECEPCION');
const canManagePatient = computed(() => store.currentUser?.role === 'ADMIN' || store.currentUser?.role === 'RECEPCION');
const visibleTabs = computed(() => [
  { id: 'resumen', label: 'Resumen Clínico', icon: 'badge' },
  { id: 'responsables', label: `Responsables (${patientGuardians.value.length})`, icon: 'supervised_user_circle' },
  { id: 'citas', label: `Citas (${patientAppointments.value.length})`, icon: 'event_available' },
  ...(canSeeFinance.value
    ? [{ id: 'pagos', label: `Pagos & Saldo (Q ${balance.value.balance.toFixed(2)})`, icon: 'payments' }]
    : []),
  { id: 'materiales', label: `Materiales (${assignedMaterials.value.length})`, icon: 'category' },
]);

const assignedMaterials = computed(() => patient.value ? store.materials.filter((m) => m.assignedPatientIds.includes(patient.value!.id)) : []);
const unassignedMaterials = computed(() => patient.value ? store.materials.filter((m) => !m.assignedPatientIds.includes(patient.value!.id)) : []);

const newGuardian = ref({
  nombres: '',
  apellidos: '',
  parentesco: 'Madre',
  telefono: '',
  email: '',
  direccion: patient.value?.direccion || '',
});

const handleCreateAndLinkGuardian = () => {
  if (!newGuardian.value.nombres.trim() || !newGuardian.value.telefono.trim() || !patient.value) return;

  store.addGuardian({
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    nombres: newGuardian.value.nombres.trim(),
    apellidos: newGuardian.value.apellidos.trim(),
    parentesco: newGuardian.value.parentesco,
    telefono: newGuardian.value.telefono.trim(),
    email: newGuardian.value.email.trim(),
    direccion: newGuardian.value.direccion.trim(),
    patientIds: [patient.value.id],
  });
  showAddGuardianModal.value = false;
  newGuardian.value = {
    nombres: '',
    apellidos: '',
    parentesco: 'Madre',
    telefono: '',
    email: '',
    direccion: patient.value.direccion || '',
  };
};
</script>

<template>
  <div v-if="patient" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#e7e2d9] overflow-hidden my-auto">
      <!-- Top Header Card -->
      <div class="p-6 bg-[#f8f3ea] border-b border-[#e7e2d9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <img
            :src="patient.photoUrl"
            :alt="patient.nombres"
            class="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#00685d]/30 shadow-xs"
          />
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-heading font-extrabold text-xl text-[#1d1c16]">
                {{ patient.nombres }} {{ patient.apellidos }}
              </h2>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="patient.estado === 'ACTIVO' ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ffdad6] text-[#ba1a1a]'"
              >
                {{ patient.estado }}
              </span>
            </div>
            <p class="text-xs text-[#3d4947] mt-0.5">
              ID Expediente: <strong class="font-mono text-[#00685d]">{{ patient.id }}</strong> • Inicio: {{ patient.fechaInicio }}
            </p>
            <p class="text-xs text-[#6d7a77]">
              Edad: <strong class="text-[#1d1c16]">{{ age.text }}</strong> ({{ minor ? 'Menor de edad' : 'Mayor de edad' }})
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center">
          <button
            v-if="canManagePatient"
            @click="emit('editPatient', patient)"
            class="px-3.5 py-2 bg-white hover:bg-[#ece8df] border border-[#bcc9c6] text-[#00685d] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
            <span>Editar Datos</span>
          </button>
          <button
            @click="emit('close')"
            class="p-2 rounded-xl text-[#6d7a77] hover:bg-[#ece8df] hover:text-[#1d1c16] cursor-pointer"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="px-6 bg-white border-b border-[#e7e2d9] flex gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="activeTab = tab.id as any"
          class="py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-[#00685d] text-[#00685d]' : 'border-transparent text-[#6d7a77] hover:text-[#1d1c16]'"
        >
          <span class="material-symbols-outlined text-base">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6">
        <!-- TAB 1: RESUMEN -->
        <div v-if="activeTab === 'resumen'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-if="canSeeFinance" class="p-4 bg-[#f8f3ea] rounded-2xl border border-[#ece8df] space-y-1">
              <span class="text-[11px] text-[#6d7a77] uppercase font-bold">Saldo Pendiente</span>
              <p class="text-xl font-extrabold" :class="balance.balance > 0 ? 'text-[#a33d23]' : 'text-[#00685d]'">
                Q {{ balance.balance.toFixed(2) }}
              </p>
              <span class="text-[11px] text-[#3d4947]">
                Total Facturado: Q {{ balance.totalCharged.toFixed(2) }}
              </span>
            </div>

            <div class="p-4 bg-[#f8f3ea] rounded-2xl border border-[#ece8df] space-y-1">
              <span class="text-[11px] text-[#6d7a77] uppercase font-bold">Fecha de Nacimiento</span>
              <p class="text-sm font-bold text-[#1d1c16]">{{ patient.fechaNacimiento }}</p>
              <span class="text-[11px] text-[#00685d] font-semibold">{{ age.text }}</span>
            </div>

            <div class="p-4 bg-[#f8f3ea] rounded-2xl border border-[#ece8df] space-y-1">
              <span class="text-[11px] text-[#6d7a77] uppercase font-bold">Requisito Tutor Legal</span>
              <p class="text-sm font-bold text-[#1d1c16]">
                {{ patientGuardians.length > 0 ? 'Registrado ✓' : 'Falta responsable ✗' }}
              </p>
              <span class="text-[11px] text-[#6d7a77]">
                {{ minor ? 'Obligatorio por minoría de edad' : 'Opcional (Adulto)' }}
              </span>
            </div>
          </div>

          <div class="p-5 bg-white rounded-2xl border border-[#bcc9c6] space-y-2">
            <div class="flex items-center gap-2 text-[#00685d] font-bold text-xs uppercase tracking-wider">
              <span class="material-symbols-outlined text-base">clinical_notes</span>
              <span>Observaciones Administrativas Generales</span>
            </div>
            <p class="text-sm text-[#3d4947] leading-relaxed">
              {{ patient.observaciones || 'Sin observaciones registradas.' }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-4 bg-[#f8f3ea] rounded-xl border border-[#ece8df] space-y-1">
              <span class="text-[#6d7a77] font-semibold block">Teléfono Principal</span>
              <p class="font-bold text-[#1d1c16] text-sm">{{ patient.telefono }}</p>
            </div>
            <div class="p-4 bg-[#f8f3ea] rounded-xl border border-[#ece8df] space-y-1">
              <span class="text-[#6d7a77] font-semibold block">Dirección Domiciliar</span>
              <p class="font-bold text-[#1d1c16] text-sm">{{ patient.direccion }}</p>
            </div>
          </div>
        </div>

        <!-- TAB 2: RESPONSABLES -->
        <div v-if="activeTab === 'responsables'" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-heading font-bold text-base text-[#1d1c16]">
                Padres y Responsables Asociados
              </h4>
              <p class="text-xs text-[#6d7a77]">
                {{ minor ? 'Requisito RF-04: Todo menor de edad debe tener al menos un responsable antes de agendar citas.' : 'Contactos autorizados de emergencia.' }}
              </p>
            </div>
            <button
              v-if="canManagePatient"
              @click="showAddGuardianModal = true"
              class="px-3.5 py-2 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">person_add</span>
              <span>Asociar Responsable</span>
            </button>
          </div>

          <div v-if="patientGuardians.length === 0" class="p-8 text-center bg-[#ffdad6]/40 border border-[#ffdad6] rounded-2xl text-xs text-[#ba1a1a] space-y-2">
            <span class="material-symbols-outlined text-3xl">warning</span>
            <p class="font-bold">No hay ningún responsable asociado a este paciente.</p>
            <p>Haga clic en "Asociar Responsable" para registrar a los padres o tutores legales.</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="g in patientGuardians"
              :key="g.id"
              class="p-5 bg-[#fef9f0] rounded-2xl border border-[#e7e2d9] space-y-3"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="g.photoUrl"
                  :alt="g.nombres"
                  class="w-12 h-12 rounded-xl object-cover ring-1 ring-[#bcc9c6]"
                />
                <div>
                  <h5 class="font-heading font-bold text-sm text-[#1d1c16]">
                    {{ g.nombres }} {{ g.apellidos }}
                  </h5>
                  <span class="text-[11px] font-bold text-[#a33d23] bg-[#ffdad2] px-2 py-0.5 rounded-full">
                    {{ g.parentesco }}
                  </span>
                </div>
              </div>

              <div class="text-xs space-y-1 text-[#3d4947] pt-2 border-t border-[#ece8df]">
                <p class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-[#00685d]">call</span>
                  <span>{{ g.telefono }}</span>
                </p>
                <p class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-[#00685d]">mail</span>
                  <span>{{ g.email }}</span>
                </p>
                <p class="flex items-center gap-1 text-[11px] text-[#6d7a77]">
                  <span class="material-symbols-outlined text-sm">location_on</span>
                  <span>{{ g.direccion }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: CITAS -->
        <div v-if="activeTab === 'citas'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-heading font-bold text-base text-[#1d1c16]">
              Historial de Citas y Sesiones Terapéuticas
            </h4>
            <router-link
              v-if="canManagePatient"
              to="/admin/citas"
              @click="emit('close')"
              class="text-xs font-bold text-[#00685d] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Programar Cita</span>
              <span class="material-symbols-outlined text-sm">add</span>
            </router-link>
          </div>

          <div v-if="patientAppointments.length === 0" class="p-8 text-center bg-[#f8f3ea] rounded-2xl border border-[#ece8df] text-xs text-[#6d7a77]">
            No existen citas registradas para este paciente.
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="apt in patientAppointments"
              :key="apt.id"
              class="p-4 bg-[#f8f3ea] rounded-xl border border-[#ece8df] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-[#1d1c16] text-sm">{{ apt.fecha }}</span>
                  <span class="text-[#00685d] font-semibold">{{ apt.horaInicio }} - {{ apt.horaFin }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="apt.estado === 'COMPLETADA' ? 'bg-[#00685d]/10 text-[#00685d]' : apt.estado === 'CONFIRMADA' ? 'bg-[#cae6fe] text-[#2f4a5d]' : 'bg-[#ffdad2] text-[#a33d23]'"
                  >
                    {{ apt.estado }}
                  </span>
                </div>
                <p class="text-[#3d4947] mt-1">
                  {{ store.services.find((s) => s.id === apt.servicioId)?.nombre }} • Atiende: {{ store.users.find((u) => u.id === apt.profesionalId)?.name }} ({{ apt.sede }})
                </p>
                <p v-if="apt.observaciones" class="text-[#6d7a77] text-[11px] italic mt-0.5">
                  "{{ apt.observaciones }}"
                </p>
              </div>

              <div class="text-right sm:self-center shrink-0">
                <span class="block text-[11px] text-[#6d7a77]">Precio Registrado</span>
                <span class="font-bold text-sm text-[#00685d]">
                  Q {{ apt.precioQ.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: PAGOS -->
        <div v-if="activeTab === 'pagos'" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-heading font-bold text-base text-[#1d1c16]">
                Pagos y Comprobantes de Pago
              </h4>
              <p class="text-xs text-[#6d7a77]">
                Saldos pendientes calculados automáticamente restando los pagos aplicados.
              </p>
            </div>
            <router-link
              to="/admin/pagos"
              @click="emit('close')"
              class="px-3.5 py-2 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Registrar Pago</span>
            </router-link>
          </div>

          <div class="p-4 bg-[#f8f3ea] rounded-2xl border border-[#ece8df] flex flex-wrap justify-between items-center gap-4 text-xs">
            <div>
              <span class="text-[#6d7a77] block font-medium">Total Facturado</span>
              <span class="text-base font-bold text-[#1d1c16]">Q {{ balance.totalCharged.toFixed(2) }}</span>
            </div>
            <div>
              <span class="text-[#6d7a77] block font-medium">Total Pagado</span>
              <span class="text-base font-bold text-[#00685d]">Q {{ balance.totalPaid.toFixed(2) }}</span>
            </div>
            <div>
              <span class="text-[#6d7a77] block font-medium">Saldo por Cobrar</span>
              <span class="text-xl font-extrabold" :class="balance.balance > 0 ? 'text-[#a33d23]' : 'text-[#00685d]'">
                Q {{ balance.balance.toFixed(2) }}
              </span>
            </div>
          </div>

          <div v-if="patientPayments.length === 0" class="p-6 text-center bg-white rounded-xl border border-[#ece8df] text-xs text-[#6d7a77]">
            No se han registrado pagos para este paciente aún.
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="p in patientPayments"
              :key="p.id"
              class="p-4 bg-white rounded-xl border border-[#bcc9c6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-[#00685d]">{{ p.numeroComprobante }}</span>
                  <span class="text-[#6d7a77]">{{ p.fecha }}</span>
                  <span class="px-2 py-0.5 rounded-full bg-[#f2ede4] font-bold text-[10px]">
                    {{ p.metodoPago }}
                  </span>
                </div>
                <p class="text-[#1d1c16] font-semibold">{{ p.concepto }}</p>
                <p v-if="p.notas" class="text-[11px] text-[#6d7a77] italic">{{ p.notas }}</p>
              </div>

              <div class="flex items-center gap-3">
                <span class="font-extrabold text-sm text-[#00685d]">
                  Q {{ p.montoQ.toFixed(2) }}
                </span>
                <button
                  @click="store.setSelectedPaymentForPrint(p)"
                  class="px-2.5 py-1.5 bg-[#f8f3ea] hover:bg-[#ece8df] text-[#00685d] border border-[#bcc9c6] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">print</span>
                  <span>Comprobante</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5: MATERIALES -->
        <div v-if="activeTab === 'materiales'" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-heading font-bold text-base text-[#1d1c16]">
                Materiales y Guías Asignadas
              </h4>
              <p class="text-xs text-[#6d7a77]">
                Recursos educativos asignados a la familia para estimulación en el hogar.
              </p>
            </div>
            <button
              @click="showAssignMaterialModal = true"
              class="px-3.5 py-2 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              <span>Asignar Material</span>
            </button>
          </div>

          <div v-if="assignedMaterials.length === 0" class="p-8 text-center bg-[#f8f3ea] rounded-2xl border border-[#ece8df] text-xs text-[#6d7a77]">
            No se han asignado materiales a este paciente.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="m in assignedMaterials"
              :key="m.id"
              class="p-4 bg-white rounded-xl border border-[#bcc9c6] flex flex-col justify-between space-y-2 text-xs"
            >
              <div>
                <div class="flex justify-between items-start">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffdad2] text-[#a33d23]">
                    {{ m.tipo }}
                  </span>
                  <button
                    @click="patient && store.removeMaterialFromPatient(m.id, patient.id)"
                    class="text-[#ba1a1a] hover:underline text-[11px] font-bold"
                  >
                    Quitar
                  </button>
                </div>
                <h5 class="font-heading font-bold text-sm text-[#1d1c16] mt-1">{{ m.titulo }}</h5>
                <p class="text-[#3d4947] text-[11px] mt-1 line-clamp-2">{{ m.descripcion }}</p>
              </div>

              <a
                :href="m.enlaceRecurso"
                target="_blank"
                rel="noreferrer"
                class="text-[#00685d] font-bold text-xs flex items-center gap-1 hover:underline pt-2 border-t border-[#ece8df]"
              >
                <span class="material-symbols-outlined text-sm">open_in_new</span>
                <span>Ver Recurso</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-4 px-6 bg-[#f8f3ea] border-t border-[#e7e2d9] flex justify-end">
        <button
          @click="emit('close')"
          class="px-5 py-2.5 bg-[#1d1c16] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Cerrar Expediente
        </button>
      </div>
    </div>

    <!-- Submodal: Add Guardian -->
    <div v-if="showAddGuardianModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          Asociar Responsable / Tutor Legal
        </h3>
        <form @submit.prevent="handleCreateAndLinkGuardian" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Nombres *</label>
            <input
              type="text"
              required
              placeholder="Ej. Mariana"
              v-model="newGuardian.nombres"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-1 focus:ring-[#00685d]"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Apellidos *</label>
            <input
              type="text"
              required
              placeholder="Ej. Gómez de Méndez"
              v-model="newGuardian.apellidos"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-1 focus:ring-[#00685d]"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Parentesco *</label>
              <select
                v-model="newGuardian.parentesco"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-1 focus:ring-[#00685d] bg-white"
              >
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Tutor Legal">Tutor Legal</option>
                <option value="Abuela">Abuela</option>
                <option value="Abuelo">Abuelo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Teléfono *</label>
              <input
                type="tel"
                required
                placeholder="+502 5555-1234"
                v-model="newGuardian.telefono"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-1 focus:ring-[#00685d]"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              v-model="newGuardian.email"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-1 focus:ring-[#00685d]"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Dirección</label>
            <input
              type="text"
              v-model="newGuardian.direccion"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-1 focus:ring-[#00685d]"
            />
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button
              type="button"
              @click="showAddGuardianModal = false"
              class="px-4 py-2 bg-[#f2ede4] text-[#1d1c16] font-semibold rounded-xl text-xs hover:bg-[#ece8df]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#00685d] text-white font-semibold rounded-xl text-xs hover:bg-[#008376]"
            >
              Guardar y Asociar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Submodal: Assign Material -->
    <div v-if="showAssignMaterialModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          Asignar Material Educativo
        </h3>
        <p v-if="unassignedMaterials.length === 0" class="text-xs text-[#6d7a77]">
          Todos los materiales ya están asignados a este paciente.
        </p>
        <div v-else class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="mat in unassignedMaterials"
            :key="mat.id"
            class="p-3 rounded-xl border border-[#ece8df] flex justify-between items-center text-xs"
          >
            <div>
              <span class="font-bold text-[#1d1c16] block">{{ mat.titulo }}</span>
              <span class="text-[10px] text-[#00685d] uppercase">{{ mat.tipo }}</span>
            </div>
            <button
              @click="patient && store.assignMaterialToPatient(mat.id, patient.id); showAssignMaterialModal = false;"
              class="px-3 py-1 bg-[#00685d] text-white rounded-lg text-xs font-bold"
            >
              Asignar
            </button>
          </div>
        </div>
        <div class="text-right">
          <button
            @click="showAssignMaterialModal = false"
            class="px-4 py-2 bg-[#f2ede4] text-[#1d1c16] rounded-xl text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
