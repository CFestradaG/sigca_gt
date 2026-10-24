<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
const router = useRouter();

const selectedMonth = ref(9); // October
const selectedYear = ref(2026);
const selectedDay = ref(10);
const selectedProfessional = ref('TODOS');

const daysInMonth = computed(() => new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate());
const firstDayOfWeek = computed(() => new Date(selectedYear.value, selectedMonth.value, 1).getDay());

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const handlePrevMonth = () => {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
};

const handleNextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
};

const formatDayDate = (day: number) => {
  const mStr = String(selectedMonth.value + 1).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  return `${selectedYear.value}-${mStr}-${dStr}`;
};

const appointmentsForSelectedDate = computed(() => {
  const dateStr = formatDayDate(selectedDay.value);
  return store.appointments
    .filter((a) => a.fecha === dateStr)
    .filter((a) => siteMatches(a.sede))
    .filter((a) => (selectedProfessional.value === 'TODOS' ? true : a.profesionalId === selectedProfessional.value))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
});

const getDayAppointments = (day: number) => {
  const dateStr = formatDayDate(day);
  return store.appointments
    .filter((a) => a.fecha === dateStr)
    .filter((a) => siteMatches(a.sede))
    .filter((a) => (selectedProfessional.value === 'TODOS' ? true : a.profesionalId === selectedProfessional.value));
};

const siteMatches = (sede: string) => {
  const value = (sede || '').toLowerCase();
  if (store.selectedSite === 'todas') return true;
  if (store.selectedSite === 'z10') return value.includes('10') || value.includes('sixtino');
  if (store.selectedSite === 'z14') return value.includes('14') || value.includes('europlaza') || value.includes('américa');
  return value.includes('línea') || value.includes('linea') || value.includes('online');
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
          Calendario Clínico de Citas
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Visualización mensual interactiva por profesional, agenda del día y horarios.
        </p>
      </div>

      <!-- Filter by Professional -->
      <div class="flex items-center gap-2 text-xs">
        <span class="text-[#6d7a77] font-semibold">Filtrar por Terapeuta:</span>
        <select
          v-model="selectedProfessional"
          class="px-3 py-2 bg-white border border-[#bcc9c6] rounded-xl text-xs font-semibold text-[#1d1c16]"
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
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Monthly Calendar Grid (Col 7) -->
      <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-4">
        <!-- Calendar Month Selector Header -->
        <div class="flex items-center justify-between">
          <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
            {{ monthNames[selectedMonth] }} {{ selectedYear }}
          </h3>
          <div class="flex items-center gap-1.5">
            <button
              @click="handlePrevMonth"
              class="w-8 h-8 rounded-lg bg-[#f8f3ea] hover:bg-[#ece8df] text-[#00685d] flex items-center justify-center cursor-pointer"
              title="Mes anterior"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              @click="handleNextMonth"
              class="w-8 h-8 rounded-lg bg-[#f8f3ea] hover:bg-[#ece8df] text-[#00685d] flex items-center justify-center cursor-pointer"
              title="Mes siguiente"
            >
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        <!-- Days of Week Row -->
        <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#6d7a77] uppercase py-1 border-b border-[#ece8df]">
          <span>Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1.5">
          <!-- Empty slots before first day -->
          <div
            v-for="i in firstDayOfWeek"
            :key="`empty-${i}`"
            class="h-14 sm:h-16 rounded-xl bg-[#f8f3ea]/40"
          ></div>

          <!-- Days in Month -->
          <button
            v-for="day in daysInMonth"
            :key="day"
            @click="selectedDay = day"
            class="h-14 sm:h-16 p-1.5 rounded-xl border flex flex-col justify-between items-start transition-all cursor-pointer relative"
            :class="selectedDay === day ? 'border-[#00685d] bg-[#00685d]/10 ring-2 ring-[#00685d]' : 'border-[#ece8df] bg-white hover:bg-[#f8f3ea]'"
          >
            <span
              class="text-xs font-bold"
              :class="selectedDay === day ? 'text-[#00685d]' : 'text-[#1d1c16]'"
            >
              {{ day }}
            </span>

            <div v-if="getDayAppointments(day).length > 0" class="w-full">
              <span class="block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#00685d] text-white text-center truncate">
                {{ getDayAppointments(day).length }} {{ getDayAppointments(day).length === 1 ? 'cita' : 'citas' }}
              </span>
            </div>
          </button>
        </div>

        <div class="pt-2 flex items-center justify-between text-xs text-[#6d7a77]">
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#00685d]"></span>
            <span>Días con citas programadas</span>
          </span>
          <span>Haga clic en un día para ver el detalle</span>
        </div>
      </div>

      <!-- Selected Day Agenda Detail (Col 5) -->
      <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-4">
        <div class="border-b border-[#ece8df] pb-3 flex justify-between items-center">
          <div>
            <span class="text-[11px] font-bold text-[#00685d] uppercase tracking-wider">
              Agenda del Día
            </span>
            <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
              {{ selectedDay }} de {{ monthNames[selectedMonth] }} {{ selectedYear }}
            </h3>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-[#f2ede4] font-bold text-xs text-[#1d1c16]">
            {{ appointmentsForSelectedDate.length }} {{ appointmentsForSelectedDate.length === 1 ? 'Cita' : 'Citas' }}
          </span>
        </div>

        <div v-if="appointmentsForSelectedDate.length === 0" class="p-8 text-center text-xs text-[#6d7a77] bg-[#f8f3ea] rounded-xl border border-[#ece8df]">
          No hay citas programadas para este día con el filtro activo.
        </div>

        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto">
          <div
            v-for="apt in appointmentsForSelectedDate"
            :key="apt.id"
            class="p-4 rounded-xl border border-[#bcc9c6] bg-[#fef9f0] space-y-2 text-xs"
          >
            <div class="flex justify-between items-start">
              <span class="font-bold text-sm text-[#00685d]">
                {{ apt.horaInicio }} - {{ apt.horaFin }}
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="apt.estado === 'COMPLETADA' ? 'bg-[#00685d]/10 text-[#00685d]' : apt.estado === 'CONFIRMADA' ? 'bg-[#cae6fe] text-[#2f4a5d]' : 'bg-[#ffdad2] text-[#a33d23]'"
              >
                {{ apt.estado }}
              </span>
            </div>

            <div>
              <button
                @click="goToPatient(apt.pacienteId)"
                class="font-heading font-bold text-sm text-[#1d1c16] hover:text-[#00685d] text-left cursor-pointer"
              >
                {{ store.patients.find((p) => p.id === apt.pacienteId)?.nombres }}
                {{ store.patients.find((p) => p.id === apt.pacienteId)?.apellidos }}
              </button>
              <p class="text-[#3d4947] font-semibold">
                {{ store.services.find((s) => s.id === apt.servicioId)?.nombre }}
              </p>
              <p class="text-[11px] text-[#6d7a77]">
                Terapeuta: {{ store.users.find((u) => u.id === apt.profesionalId)?.name }} ({{ apt.sede }})
              </p>
            </div>

            <div class="pt-2 border-t border-[#ece8df] flex justify-between items-center text-[11px]">
              <span class="text-[#6d7a77]">
                Tarifa: <strong class="text-[#00685d]">Q {{ apt.precioQ.toFixed(2) }}</strong>
              </span>

              <button
                @click="goToPatient(apt.pacienteId)"
                class="font-bold text-[#00685d] hover:underline cursor-pointer"
              >
                Ver Expediente &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
