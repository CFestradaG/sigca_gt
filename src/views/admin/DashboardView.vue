<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
const router = useRouter();

const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
const canSeeFinance = computed(() => store.currentUser?.role === 'ADMIN' || store.currentUser?.role === 'RECEPCION');
const canManageClinical = computed(() => store.currentUser?.role === 'ADMIN' || store.currentUser?.role === 'RECEPCION');

const todayAppointments = computed(() => {
  return store.appointments.filter((a) => {
    if (a.fecha !== todayStr) return false;
    const venue = (a.sede || '').toLowerCase();
    if (store.selectedSite === 'todas') return true;
    if (store.selectedSite === 'z10') return venue.includes('10') || venue.includes('sixtino');
    if (store.selectedSite === 'z14') return venue.includes('14') || venue.includes('europlaza') || venue.includes('américa');
    return venue.includes('línea') || venue.includes('linea') || venue.includes('online');
  });
});

const completedToday = computed(() => todayAppointments.value.filter((a) => a.estado === 'COMPLETADA').length);
const confirmedToday = computed(() => todayAppointments.value.filter((a) => a.estado === 'CONFIRMADA').length);
const pendingToday = computed(() => todayAppointments.value.filter((a) => a.estado === 'PENDIENTE').length);

const pendingRequests = computed(() => store.requests.filter((r) => r.estado === 'PENDIENTE'));

const todayIncomeQ = computed(() => {
  // RN-19: los pagos anulados no cuentan como ingreso.
  return store.payments
    .filter((p: any) => p.estado !== 'ANULADO' && p.fecha.startsWith(todayStr))
    .reduce((sum, p) => sum + p.montoQ, 0);
});

const activePatientsCount = computed(() => store.patients.filter((p) => p.estado === 'ACTIVO').length);

const goToPatientFile = (patientId: string) => {
  store.setSelectedPatientId(patientId);
  router.push('/admin/pacientes');
};
</script>

<template>
  <div class="space-y-8">
    <!-- Top Banner & Greeting -->
    <section class="bg-[#f8f3ea] p-6 sm:p-8 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div class="space-y-2 max-w-2xl">
        <div class="flex flex-wrap items-center gap-2 text-xs font-bold text-[#00685d]">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8cf5e4]/60 text-[#005048]">
            <span class="w-2 h-2 rounded-full bg-[#00685d] animate-pulse"></span>
            Sistema Operativo • Sincronizado SAT-FEL
          </span>
          <span class="text-[#3d4947]">• Ciudad de Guatemala</span>
        </div>

        <h1 class="font-heading font-extrabold text-2xl sm:text-3xl text-[#1d1c16]">
          Bienvenido, <span class="text-[#00685d]">{{ store.currentUser?.name }}</span>
        </h1>

        <p class="text-xs sm:text-sm text-[#3d4947]">
          Centro Armonía • Sede Zona 10 (Edificio Sixtino II) & Sede Zona 14 (Europlaza)
        </p>
      </div>

      <!-- Quick action buttons -->
      <div v-if="canManageClinical" class="flex flex-wrap items-center gap-3">
        <router-link
          to="/admin/citas"
          class="px-4 py-2.5 bg-[#a33d23] hover:bg-[#83260e] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">add_circle</span>
          <span>Nueva Cita</span>
        </router-link>

        <router-link
          to="/admin/pacientes"
          class="px-4 py-2.5 bg-white hover:bg-[#ece8df] border border-[#bcc9c6] text-[#00685d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">person_add</span>
          <span>Registrar Paciente</span>
        </router-link>
      </div>
    </section>

    <!-- 4 Bento Metric Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Card 1: Agenda Diaria -->
      <div class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77]">
              Agenda de Hoy
            </span>
            <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16] mt-1">
              {{ todayAppointments.length }} Citas
            </h2>
          </div>
          <div class="w-11 h-11 rounded-xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-[#ece8df] space-y-1.5">
          <div class="flex justify-between text-xs text-[#3d4947]">
            <span>{{ completedToday }} finalizadas</span>
            <span>{{ confirmedToday }} confirmadas</span>
            <span>{{ pendingToday }} pendientes</span>
          </div>
          <div class="w-full bg-[#e7e2d9] h-2 rounded-full overflow-hidden flex">
            <div
              class="bg-[#00685d] h-full"
              :style="{ width: `${todayAppointments.length ? (completedToday / todayAppointments.length) * 100 : 0}%` }"
            ></div>
            <div
              class="bg-[#a33d23] h-full"
              :style="{ width: `${todayAppointments.length ? (confirmedToday / todayAppointments.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Card 2: Solicitudes Web -->
      <div v-if="canManageClinical" class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77]">
              Solicitudes Web
            </span>
            <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16] mt-1">
              {{ pendingRequests.length }} Nuevas
            </h2>
          </div>
          <div class="w-11 h-11 rounded-xl bg-[#ffdad2] text-[#a33d23] flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">mark_email_unread</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-[#ece8df] flex items-center justify-between">
          <span class="text-xs text-[#a33d23] font-bold">Requieren atención</span>
          <router-link
            to="/admin/solicitudes"
            class="text-xs font-bold text-[#00685d] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Revisar bandeja</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </router-link>
        </div>
      </div>

      <!-- Card 3: Recaudación Diaria -->
      <div v-if="canSeeFinance" class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77]">
              Recaudación Hoy (Q)
            </span>
            <h2 class="font-heading font-extrabold text-2xl text-[#00685d] mt-1">
              Q {{ todayIncomeQ.toFixed(2) }}
            </h2>
          </div>
          <div class="w-11 h-11 rounded-xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-[#ece8df] flex items-center justify-between">
          <span class="text-xs text-[#3d4947]">
            Caja: <strong :class="store.cashRegister.estado === 'ABIERTA' ? 'text-[#00685d]' : 'text-[#a33d23]'">{{ store.cashRegister.estado }}</strong>
          </span>
          <router-link
            to="/admin/caja-diaria"
            class="text-xs font-bold text-[#00685d] hover:underline cursor-pointer"
          >
            Ver Caja Diaria
          </router-link>
        </div>
      </div>

      <!-- Card 4: Pacientes Activos -->
      <div class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-col justify-between">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77]">
              Pacientes Activos
            </span>
            <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16] mt-1">
              {{ activePatientsCount }} Expedientes
            </h2>
          </div>
          <div class="w-11 h-11 rounded-xl bg-[#cae6fe] text-[#455f73] flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">family_restroom</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-[#ece8df] flex items-center justify-between">
          <span class="text-xs text-[#3d4947]">100% menores con tutor</span>
          <router-link
            to="/admin/pacientes"
            class="text-xs font-bold text-[#00685d] hover:underline cursor-pointer"
          >
            Ver Pacientes
          </router-link>
        </div>
      </div>
    </section>

    <!-- Main Content Row: Today's Appointments & Pending Solicitudes -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Today's Appointments Timeline (Col 8) -->
      <div class="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
              Citas Programadas para Hoy
            </h3>
            <p class="text-xs text-[#6d7a77]">Horarios y control de asistencia clínica</p>
          </div>
          <router-link
            to="/admin/calendario"
            class="text-xs font-bold text-[#00685d] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Calendario Completo</span>
            <span class="material-symbols-outlined text-sm">event</span>
          </router-link>
        </div>

        <div v-if="todayAppointments.length === 0" class="p-8 text-center text-xs text-[#6d7a77] bg-[#f8f3ea] rounded-xl border border-[#ece8df]">
          No hay citas programadas para la fecha actual.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="apt in todayAppointments"
            :key="apt.id"
            class="p-4 rounded-xl border border-[#ece8df] hover:border-[#bcc9c6] bg-[#fef9f0] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div class="flex items-start gap-3">
              <div class="text-center px-3 py-2 bg-white rounded-xl border border-[#bcc9c6] shrink-0">
                <span class="block font-bold text-sm text-[#00685d]">
                  {{ apt.horaInicio }}
                </span>
                <span class="block text-[11px] text-[#6d7a77]">
                  {{ apt.horaFin }}
                </span>
              </div>

              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <button
                    @click="goToPatientFile(apt.pacienteId)"
                    class="font-heading font-bold text-sm text-[#1d1c16] hover:text-[#00685d] text-left cursor-pointer"
                  >
                    {{ store.patients.find((p) => p.id === apt.pacienteId)?.nombres }}
                    {{ store.patients.find((p) => p.id === apt.pacienteId)?.apellidos }}
                  </button>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="apt.estado === 'COMPLETADA' ? 'bg-[#00685d]/10 text-[#00685d]' : apt.estado === 'CONFIRMADA' ? 'bg-[#cae6fe] text-[#2f4a5d]' : apt.estado === 'CANCELADA' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#ffdad2] text-[#a33d23]'"
                  >
                    {{ apt.estado }}
                  </span>
                </div>

                <p class="text-xs text-[#3d4947]">
                  <strong class="text-[#1d1c16]">{{ store.services.find((s) => s.id === apt.servicioId)?.nombre }}</strong> •
                  {{ store.users.find((u) => u.id === apt.profesionalId)?.name }}
                </p>
                <p class="text-[11px] text-[#6d7a77]">
                  {{ apt.sede }} • Honorario: <strong>Q {{ apt.precioQ.toFixed(2) }}</strong>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 self-end sm:self-center">
              <button
                v-if="apt.estado !== 'COMPLETADA'"
                @click="store.updateAppointmentStatus(apt.id, 'COMPLETADA')"
                title="Marcar como atendida/completada"
                class="px-2.5 py-1.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-sm">check</span>
                <span>Completar</span>
              </button>

              <button
                @click="goToPatientFile(apt.pacienteId)"
                title="Ver Ficha Clínica del Paciente"
                class="px-2.5 py-1.5 bg-white border border-[#bcc9c6] text-[#3d4947] hover:bg-[#ece8df] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Expediente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Requests & Quick Actions (Col 4) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Urgent Web Requests -->
        <div class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-heading font-bold text-base text-[#1d1c16]">
              Solicitudes por Atender
            </h3>
            <span class="px-2 py-0.5 rounded-full bg-[#ffdad2] text-[#a33d23] text-xs font-bold">
              {{ pendingRequests.length }}
            </span>
          </div>

          <p v-if="pendingRequests.length === 0" class="text-xs text-[#6d7a77] py-2">
            No hay solicitudes pendientes en este momento.
          </p>

          <div v-else class="space-y-3">
            <div
              v-for="req in pendingRequests.slice(0, 3)"
              :key="req.id"
              class="p-3 bg-[#f8f3ea] rounded-xl border border-[#ece8df] space-y-1.5"
            >
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-xs text-[#1d1c16]">
                  {{ req.solicitanteNombre }}
                </h4>
                <span class="text-[10px] text-[#6d7a77]">{{ req.fechaCreacion.split(' ')[0] }}</span>
              </div>
              <p class="text-[11px] text-[#00685d] font-semibold">
                {{ store.services.find((s) => s.id === req.servicioId)?.nombre }}
              </p>
              <p class="text-[11px] text-[#3d4947] line-clamp-1 italic">
                "{{ req.mensaje || 'Sin notas adicionales' }}"
              </p>
              <div class="pt-1 flex justify-between items-center text-[11px]">
                <span class="text-[#6d7a77]">{{ req.telefono }}</span>
                <router-link
                  to="/admin/solicitudes"
                  class="font-bold text-[#a33d23] hover:underline"
                >
                  Atender &gt;
                </router-link>
              </div>
            </div>
          </div>

          <router-link
            to="/admin/solicitudes"
            class="w-full py-2 bg-[#f2ede4] hover:bg-[#ece8df] text-[#00685d] rounded-xl text-xs font-bold transition-colors cursor-pointer block text-center"
          >
            Ver Todas las Solicitudes
          </router-link>
        </div>

        <!-- Quick Shortcuts -->
        <div class="bg-[#00685d] text-white p-6 rounded-2xl shadow-xs space-y-3">
          <h4 class="font-heading font-bold text-base">Acceso Rápido a Operaciones</h4>
          <div class="space-y-2 text-xs">
            <router-link
              to="/admin/pagos"
              class="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-left flex items-center justify-between cursor-pointer"
            >
              <span>Registrar Pago / Abono de Paciente</span>
              <span class="material-symbols-outlined text-sm">payments</span>
            </router-link>
            <router-link
              to="/admin/caja-diaria"
              class="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-left flex items-center justify-between cursor-pointer"
            >
              <span>Movimiento de Caja Diaria</span>
              <span class="material-symbols-outlined text-sm">point_of_sale</span>
            </router-link>
            <router-link
              to="/admin/materiales"
              class="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-left flex items-center justify-between cursor-pointer"
            >
              <span>Asignar Material Educativo a Paciente</span>
              <span class="material-symbols-outlined text-sm">category</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
