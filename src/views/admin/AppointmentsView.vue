<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';
import { Appointment, AppointmentStatus } from '../../types';

const store = useAppStore();
const router = useRouter();

const statusFilter = ref<'TODAS' | AppointmentStatus>('TODAS');
const professionalFilter = ref<string>('TODOS');
const dateFilter = ref<string>('');
const sortKey = ref<'fecha' | 'paciente' | 'servicio' | 'profesional' | 'precioQ' | 'estado'>('fecha');
const sortAscending = ref(false);
const toggleSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) sortAscending.value = !sortAscending.value;
  else { sortKey.value = key; sortAscending.value = true; }
};

const showNewAptModal = ref(false);
const reschedulingApt = ref<Appointment | null>(null);
const errorMsg = ref('');
const availability = ref<{ available: boolean; message: string; horaFin?: string } | null>(null);
const checkingAvailability = ref(false);
const reschedulingError = ref('');
const isRescheduling = ref(false);
const createNewPatient = ref(false);
const savedDraftPatientId = ref('');
const savedDraftGuardian = ref(false);
const newPatient = ref({ nombres: '', apellidos: '', fechaNacimiento: '', sexo: 'Otro' as 'M' | 'F' | 'Otro' });
const newGuardian = ref({ nombres: '', apellidos: '', parentesco: '', telefono: '', email: '' });

const form = ref({
  pacienteId: store.patients[0]?.id || '',
  servicioId: store.services[0]?.id || '',
  profesionalId: store.users.find((u) => u.role === 'PROFESIONAL')?.id || store.users[0]?.id || '',
  fecha: new Date().toISOString().slice(0, 10),
  horaInicio: '09:00',
  horaFin: '09:45',
  sede: 'Sede Central - Zona 10',
  observaciones: '',
});

const rescheduleData = ref({
  fecha: '',
  horaInicio: '09:00',
  horaFin: '09:45',
});

const handleOpenNew = () => {
  errorMsg.value = '';
  createNewPatient.value = false;
  savedDraftPatientId.value = '';
  savedDraftGuardian.value = false;
  newPatient.value = { nombres: '', apellidos: '', fechaNacimiento: '', sexo: 'Otro' };
  newGuardian.value = { nombres: '', apellidos: '', parentesco: '', telefono: '', email: '' };
  form.value = {
    pacienteId: store.patients[0]?.id || '',
    servicioId: store.services[0]?.id || '',
    profesionalId: store.users.find((u) => u.role === 'PROFESIONAL')?.id || store.users[0]?.id || '',
    fecha: new Date().toISOString().slice(0, 10),
    horaInicio: '09:00',
    horaFin: '09:45',
    sede: 'Sede Central - Zona 10',
    observaciones: '',
  };
  showNewAptModal.value = true;
};

watch(() => [showNewAptModal.value, createNewPatient.value, form.value.pacienteId, form.value.servicioId, form.value.profesionalId, form.value.fecha, form.value.horaInicio, form.value.sede], async () => {
  availability.value = null;
  if (!showNewAptModal.value || createNewPatient.value || !form.value.pacienteId || !form.value.servicioId || !form.value.profesionalId || !form.value.fecha || !form.value.horaInicio || !form.value.sede) return;
  checkingAvailability.value = true;
  try {
    availability.value = await store.checkAppointmentAvailability({ ...form.value });
    if (availability.value.horaFin) form.value.horaFin = availability.value.horaFin;
  } catch (err: any) {
    availability.value = { available: false, message: err?.message || 'No se pudo consultar la disponibilidad.' };
  } finally {
    checkingAvailability.value = false;
  }
});

const handleCreateAppointment = async () => {
  errorMsg.value = '';
  try {
    let patientId = form.value.pacienteId;
    let patient = createNewPatient.value && savedDraftPatientId.value
      ? store.patients.find((item) => item.id === savedDraftPatientId.value)
      : store.patients.find((item) => item.id === patientId);

    if (createNewPatient.value) {
      if (!newPatient.value.nombres.trim() || !newPatient.value.apellidos.trim() || !newPatient.value.fechaNacimiento) throw new Error('Completa nombres, apellidos y fecha de nacimiento del paciente nuevo.');
      if (store.isMinor(newPatient.value.fechaNacimiento) && (!newGuardian.value.nombres.trim() || !newGuardian.value.apellidos.trim() || !newGuardian.value.parentesco.trim() || !newGuardian.value.telefono.trim())) {
        throw new Error('El paciente es menor de edad. Completa los datos obligatorios de su responsable.');
      }
      if (!patient) {
        patient = await store.addPatient({
          ...newPatient.value, nombres: newPatient.value.nombres.trim(), apellidos: newPatient.value.apellidos.trim(),
          telefono: '', direccion: '', fechaInicio: new Date().toISOString().slice(0, 10),
          observaciones: 'Registrado al programar una cita.', estado: 'ACTIVO', photoUrl: '',
        });
        savedDraftPatientId.value = patient.id;
      }
      patientId = patient.id;
      if (store.isMinor(patient.fechaNacimiento) && !store.getPatientGuardians(patient.id).length && !savedDraftGuardian.value) {
        await store.addGuardian({ ...newGuardian.value, nombres: newGuardian.value.nombres.trim(), apellidos: newGuardian.value.apellidos.trim(), parentesco: newGuardian.value.parentesco.trim(), telefono: newGuardian.value.telefono.trim(), email: newGuardian.value.email.trim(), direccion: '', patientIds: [patient.id], photoUrl: '' });
        savedDraftGuardian.value = true;
      }
    }
    if (!patient) throw new Error('Selecciona un paciente o completa los datos del paciente nuevo.');
    if (store.isMinor(patient.fechaNacimiento) && store.getPatientGuardians(patient.id).length === 0) throw new Error(`Regla RF-04: ${patient.nombres} ${patient.apellidos} es menor de 18 años y necesita un responsable registrado.`);

    const srv = store.services.find((s) => s.id === form.value.servicioId) || store.services[0];
    if (!srv) throw new Error('Selecciona un servicio activo.');
    const currentAvailability = await store.checkAppointmentAvailability({ ...form.value, pacienteId: patientId });
    availability.value = currentAvailability;
    if (!currentAvailability.available) { errorMsg.value = currentAvailability.message; return; }
    await store.createAppointment({
    pacienteId: patientId,
    servicioId: srv.id,
    profesionalId: form.value.profesionalId,
    fecha: form.value.fecha,
    horaInicio: form.value.horaInicio,
    horaFin: form.value.horaFin,
    precioQ: srv.precioQ,
    estado: 'PENDIENTE',
    observaciones: form.value.observaciones.trim(),
    sede: form.value.sede,
    });
    showNewAptModal.value = false;
  } catch (err: any) {
    errorMsg.value = err?.message || 'No se pudo programar la cita.';
  }
};

const handleSaveReschedule = async () => {
  if (!reschedulingApt.value) return;
  reschedulingError.value = '';
  isRescheduling.value = true;
  try {
    const apt = reschedulingApt.value;
    const result = await store.checkAppointmentAvailability({
      pacienteId: apt.pacienteId,
      servicioId: apt.servicioId,
      profesionalId: apt.profesionalId,
      fecha: rescheduleData.value.fecha,
      horaInicio: rescheduleData.value.horaInicio,
      sede: apt.sede,
      idToIgnore: apt.id,
    });
    if (!result.available) throw new Error(result.message);
    await store.rescheduleAppointment(apt.id, rescheduleData.value.fecha, rescheduleData.value.horaInicio, result.horaFin || rescheduleData.value.horaFin);
    reschedulingApt.value = null;
  } catch (err: any) {
    reschedulingError.value = err?.message || 'No se pudo reprogramar la cita.';
  } finally {
    isRescheduling.value = false;
  }
};

const filteredAppointments = computed(() => {
  return store.appointments
    .filter((a) => {
      const site = store.selectedSite;
      if (site === 'todas') return true;
      const venue = (a.sede || '').toLowerCase();
      return site === 'z10' ? venue.includes('10') || venue.includes('sixtino') : site === 'z14' ? venue.includes('14') || venue.includes('europlaza') || venue.includes('américa') : venue.includes('línea') || venue.includes('linea') || venue.includes('online');
    })
    .filter((a) => (statusFilter.value === 'TODAS' ? true : a.estado === statusFilter.value))
    .filter((a) => (professionalFilter.value === 'TODOS' ? true : a.profesionalId === professionalFilter.value))
    .filter((a) => (dateFilter.value ? a.fecha === dateFilter.value : true))
    .sort((a, b) => {
      const patientName = (apt: Appointment) => { const p = store.patients.find((item) => item.id === apt.pacienteId); return `${p?.nombres || ''} ${p?.apellidos || ''}`.toLowerCase(); };
      const value = (apt: Appointment) => sortKey.value === 'paciente' ? patientName(apt) : sortKey.value === 'servicio' ? (store.services.find((s) => s.id === apt.servicioId)?.nombre || '') : sortKey.value === 'profesional' ? (store.users.find((u) => u.id === apt.profesionalId)?.name || '') : String(apt[sortKey.value] || '');
      const compared = value(a).localeCompare(value(b), 'es', { numeric: true });
      return (sortAscending.value ? compared : -compared) || b.fecha.localeCompare(a.fecha) || b.horaInicio.localeCompare(a.horaInicio) || b.fechaCreacion.localeCompare(a.fechaCreacion);
    });
});

const canManageAppointments = computed(() => store.currentUser?.role === 'ADMIN' || store.currentUser?.role === 'RECEPCION');
const actionError = ref('');

const changeStatus = async (apt: Appointment, status: Appointment['estado']) => {
  actionError.value = '';
  try {
    await store.updateAppointmentStatus(apt.id, status);
  } catch (err: any) {
    actionError.value = err?.message || 'No se pudo actualizar el estado de la cita.';
  }
};

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
          Gestión y Programación de Citas
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Control de citas, estados clínicos, asignación de terapeutas y validación de tutores.
        </p>
      </div>

      <div class="flex gap-2">
        <router-link
          to="/admin/calendario"
          class="px-4 py-2.5 bg-white hover:bg-[#ece8df] border border-[#bcc9c6] text-[#00685d] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span class="material-symbols-outlined text-base">calendar_month</span>
          <span>Vista Calendario</span>
        </router-link>

        <button
          v-if="canManageAppointments"
          @click="handleOpenNew"
          class="px-4 py-2.5 bg-[#a33d23] hover:bg-[#83260e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">add_circle</span>
          <span>Programar Cita</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-4 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-1 overflow-x-auto">
        <button
          v-for="st in (['TODAS', 'PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'] as const)"
          :key="st"
          @click="statusFilter = st"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="statusFilter === st ? 'bg-[#00685d] text-white' : 'bg-[#f2ede4] text-[#3d4947] hover:bg-[#ece8df]'"
        >
          {{ st }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-1 text-xs">
          <span class="text-[#6d7a77] font-semibold">Profesional:</span>
          <select
            v-model="professionalFilter"
            class="px-2.5 py-1.5 bg-[#f8f3ea] border border-[#bcc9c6] rounded-xl text-xs font-semibold text-[#1d1c16]"
          >
            <option value="TODOS">Todos los profesionales</option>
            <option
              v-for="u in store.users.filter((u) => u.role === 'PROFESIONAL' || u.role === 'ADMIN')"
              :key="u.id"
              :value="u.id"
            >
              {{ u.name }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-1 text-xs">
          <span class="text-[#6d7a77] font-semibold">Fecha:</span>
          <input
            type="date"
            v-model="dateFilter"
            class="px-2.5 py-1.5 bg-[#f8f3ea] border border-[#bcc9c6] rounded-xl text-xs font-semibold text-[#1d1c16]"
          />
          <button
            v-if="dateFilter"
            @click="dateFilter = ''"
            class="text-xs text-[#ba1a1a] font-bold hover:underline"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <div v-if="actionError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs font-semibold">
      {{ actionError }}
    </div>

    <!-- Appointments List Table -->
    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#f8f3ea] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
            <tr>
              <th class="py-3 px-4 cursor-pointer" @click="toggleSort('fecha')">Fecha y Horario {{ sortKey === 'fecha' ? (sortAscending ? '↑' : '↓') : '↕' }}</th>
              <th class="py-3 px-4 cursor-pointer" @click="toggleSort('paciente')">Paciente {{ sortKey === 'paciente' ? (sortAscending ? '↑' : '↓') : '↕' }}</th>
              <th class="py-3 px-4 cursor-pointer" @click="toggleSort('servicio')">Servicio Terapéutico {{ sortKey === 'servicio' ? (sortAscending ? '↑' : '↓') : '↕' }}</th>
              <th class="py-3 px-4 cursor-pointer" @click="toggleSort('profesional')">Profesional Asignado {{ sortKey === 'profesional' ? (sortAscending ? '↑' : '↓') : '↕' }}</th>
              <th class="py-3 px-4 cursor-pointer" @click="toggleSort('precioQ')">Precio (Q) {{ sortKey === 'precioQ' ? (sortAscending ? '↑' : '↓') : '↕' }}</th>
              <th class="py-3 px-4 cursor-pointer" @click="toggleSort('estado')">Estado {{ sortKey === 'estado' ? (sortAscending ? '↑' : '↓') : '↕' }}</th>
              <th class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#ece8df]">
            <tr v-if="filteredAppointments.length === 0">
              <td colspan="7" class="py-8 text-center text-[#6d7a77]">
                No se encontraron citas con los filtros seleccionados.
              </td>
            </tr>
            <tr
              v-for="apt in filteredAppointments"
              :key="apt.id"
              class="hover:bg-[#fef9f0] transition-colors"
            >
              <td class="py-3.5 px-4">
                <span class="font-bold text-[#1d1c16] block">{{ apt.fecha }}</span>
                <span class="text-[#00685d] font-semibold text-[11px]">
                  {{ apt.horaInicio }} - {{ apt.horaFin }}
                </span>
                <span class="block text-[10px] text-[#6d7a77]">{{ apt.sede }}</span>
              </td>

              <td class="py-3.5 px-4">
                <button
                  @click="goToPatient(apt.pacienteId)"
                  class="font-heading font-bold text-sm text-[#1d1c16] hover:text-[#00685d] text-left cursor-pointer"
                >
                  {{ store.patients.find((p) => p.id === apt.pacienteId)?.nombres }}
                  {{ store.patients.find((p) => p.id === apt.pacienteId)?.apellidos }}
                </button>
                <span class="block text-[11px] text-[#6d7a77]">{{ apt.pacienteId }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="font-semibold text-[#1d1c16] block">{{ store.services.find((s) => s.id === apt.servicioId)?.nombre }}</span>
                <span class="text-[11px] text-[#6d7a77]">{{ store.services.find((s) => s.id === apt.servicioId)?.categoria }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="font-semibold text-[#1d1c16] block">{{ store.users.find((u) => u.id === apt.profesionalId)?.name }}</span>
                <span class="text-[11px] text-[#6d7a77]">{{ store.users.find((u) => u.id === apt.profesionalId)?.specialty }}</span>
              </td>

              <td class="py-3.5 px-4">
                <span class="font-extrabold text-[#00685d] text-sm">
                  Q {{ apt.precioQ.toFixed(2) }}
                </span>
              </td>

              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="apt.estado === 'COMPLETADA' ? 'bg-[#00685d]/10 text-[#00685d]' : apt.estado === 'CONFIRMADA' ? 'bg-[#cae6fe] text-[#2f4a5d]' : apt.estado === 'CANCELADA' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#ffdad2] text-[#a33d23]'"
                >
                  {{ apt.estado }}
                </span>
              </td>

              <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                <button
                  v-if="canManageAppointments && apt.estado === 'PENDIENTE'"
                  @click="changeStatus(apt, 'CONFIRMADA')"
                  title="Confirmar cita"
                  class="px-2 py-1 bg-[#00685d] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  Confirmar
                </button>

                <button
                  v-if="apt.estado === 'CONFIRMADA'"
                  @click="changeStatus(apt, 'COMPLETADA')"
                  title="Marcar completada / atendida"
                  class="px-2 py-1 bg-[#00685d] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  Completar
                </button>

                <template v-if="canManageAppointments && apt.estado !== 'COMPLETADA' && apt.estado !== 'CANCELADA'">
                  <button
                    @click="reschedulingError = ''; reschedulingApt = apt; rescheduleData = { fecha: apt.fecha, horaInicio: apt.horaInicio, horaFin: apt.horaFin }"
                    title="Reprogramar horario o fecha"
                    class="px-2 py-1 bg-[#f2ede4] hover:bg-[#ece8df] text-[#1d1c16] rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Reprogramar
                  </button>

                  <button
                    @click="changeStatus(apt, 'CANCELADA')"
                    title="Cancelar cita"
                    class="px-2 py-1 bg-[#ffdad6] hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Appointment Modal -->
    <div v-if="showNewAptModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6] max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-[#ece8df] pb-3">
          <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
            Programar Nueva Cita Terapéutica
          </h3>
          <button @click="showNewAptModal = false" class="text-[#6d7a77]">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div v-if="errorMsg" class="p-3.5 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold leading-relaxed">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleCreateAppointment" class="space-y-4 text-xs">
          <div>
            <div class="flex items-center justify-between mb-1"><label class="block font-bold text-[#1d1c16]">Paciente *</label><button type="button" @click="createNewPatient = !createNewPatient; errorMsg = ''; availability = null" class="font-bold text-[#00685d] underline">{{ createNewPatient ? 'Elegir paciente registrado' : 'Registrar paciente nuevo' }}</button></div>
            <div v-if="createNewPatient" class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <input v-model="newPatient.nombres" required placeholder="Nombres del paciente *" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                <input v-model="newPatient.apellidos" required placeholder="Apellidos del paciente *" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                <input v-model="newPatient.fechaNacimiento" required type="date" :max="new Date().toISOString().slice(0, 10)" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                <select v-model="newPatient.sexo" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"><option value="Otro">Sin especificar</option><option value="F">Femenino</option><option value="M">Masculino</option></select>
              </div>
              <div v-if="newPatient.fechaNacimiento && store.isMinor(newPatient.fechaNacimiento)" class="p-3 rounded-xl bg-[#f8f3ea] space-y-2">
                <p class="font-bold text-[#1d1c16]">Responsable del paciente menor *</p>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="newGuardian.nombres" required placeholder="Nombres *" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                  <input v-model="newGuardian.apellidos" required placeholder="Apellidos *" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                  <input v-model="newGuardian.parentesco" required placeholder="Parentesco *" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                  <input v-model="newGuardian.telefono" required type="tel" placeholder="Teléfono *" class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                  <input v-model="newGuardian.email" type="email" placeholder="Correo (opcional)" class="col-span-2 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs" />
                </div>
              </div>
            </div>
            <select
              v-else
              v-model="form.pacienteId"
              @change="errorMsg = ''"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
            >
              <option
                v-for="p in store.patients.filter((p) => p.estado === 'ACTIVO')"
                :key="p.id"
                :value="p.id"
              >
                {{ p.nombres }} {{ p.apellidos }} ({{ p.id }}) {{ store.isMinor(p.fechaNacimiento) ? '• Menor' : '• Adulto' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">
              Servicio Clínico (Copia automáticamente duración y precio) *
            </label>
            <select
              v-model="form.servicioId"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
            >
              <option
                v-for="s in store.services.filter((s) => s.estado === 'ACTIVO')"
                :key="s.id"
                :value="s.id"
              >
                {{ s.nombre }} — Q {{ s.precioQ.toFixed(2) }} ({{ s.duracionMinutos }} min)
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Profesional *</label>
            <select
              v-model="form.profesionalId"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
            >
              <option
                v-for="u in store.users.filter((u) => u.role === 'PROFESIONAL' || u.role === 'ADMIN')"
                :key="u.id"
                :value="u.id"
              >
                {{ u.name }} ({{ u.specialty || u.role }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Fecha *</label>
              <input
                type="date"
                required
                v-model="form.fecha"
                class="w-full px-2.5 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Hora Inicio *</label>
              <input
                type="time"
                required
                v-model="form.horaInicio"
                class="w-full px-2.5 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Hora Fin *</label>
              <input
                type="time"
                required
                v-model="form.horaFin"
                readonly
                class="w-full px-2.5 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Sede *</label>
            <select
              v-model="form.sede"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
            >
              <option value="Sede Central - Zona 10">Sede Central - Zona 10</option>
              <option value="Sede Las Américas - Zona 14">Sede Las Américas - Zona 14</option>
              <option value="En Línea (Teleterapia)">En Línea (Teleterapia)</option>
            </select>
          </div>

          <div v-if="checkingAvailability" class="p-3 rounded-xl bg-[#f2ede4] text-xs text-[#3d4947] flex items-center gap-2">
            <span class="material-symbols-outlined animate-spin text-base">progress_activity</span> Consultando sede, horario y agenda del profesional…
          </div>
          <div v-else-if="availability" role="status" class="p-3 rounded-xl text-xs font-semibold" :class="availability.available ? 'bg-[#e0f5ee] text-[#00685d]' : 'bg-[#ffdad2] text-[#731a04]'">
            {{ availability.available ? `Disponible en ${form.sede}: ${availability.message}` : availability.message }}
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Observaciones</label>
            <textarea
              rows="2"
              v-model="form.observaciones"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-3">
            <button
              type="button"
              @click="showNewAptModal = false"
              class="px-4 py-2 bg-[#f2ede4] hover:bg-[#ece8df] text-[#1d1c16] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="checkingAvailability || (!createNewPatient && availability?.available !== true)"
              class="px-5 py-2 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {{ checkingAvailability ? 'Verificando…' : 'Guardar Cita' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="reschedulingApt" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          Reprogramar Cita ({{ reschedulingApt.id }})
        </h3>
        <form @submit.prevent="handleSaveReschedule" class="space-y-4 text-xs">
          <div v-if="reschedulingError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04]">{{ reschedulingError }}</div>
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Nueva Fecha *</label>
            <input
              type="date"
              required
              v-model="rescheduleData.fecha"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Nueva Hora Inicio *</label>
              <input
                type="time"
                required
                v-model="rescheduleData.horaInicio"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Nueva Hora Fin *</label>
              <input
                type="time"
                required
                v-model="rescheduleData.horaFin"
              readonly
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button
              type="button"
              @click="reschedulingApt = null"
              class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isRescheduling"
              class="px-5 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {{ isRescheduling ? 'Verificando…' : 'Guardar Reprogramación' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
