<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';
import { UserRole } from '../../types';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'openLogin'): void;
}>();

const store = useAppStore();
const route = useRoute();
const router = useRouter();

const currentRole = computed<UserRole>(() => store.activeRoleView || store.currentUser?.role || 'ADMIN');

const handleRoleChange = (event: Event) => {
  const role = (event.target as HTMLSelectElement).value as UserRole;
  store.setActiveRoleView(role);

  // If the current route is not permitted for the new role, redirect to dashboard
  const currentNav = navItems.find((item) => item.path === route.path);
  if (currentNav && !currentNav.roles.includes(role)) {
    router.push('/admin/dashboard');
  }
};

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  { path: '/admin/pacientes', label: 'Pacientes', icon: 'family_restroom', roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  { path: '/admin/responsables', label: 'Responsables', icon: 'supervised_user_circle', roles: ['ADMIN', 'RECEPCION'] },
  { path: '/admin/servicios', label: 'Servicios', icon: 'clinical_notes', roles: ['ADMIN', 'RECEPCION'] },
  { path: '/admin/solicitudes', label: 'Solicitudes', icon: 'inbox', badge: computed(() => store.pendingRequestsCount > 0 ? store.pendingRequestsCount : undefined), roles: ['ADMIN', 'RECEPCION'] },
  { path: '/admin/citas', label: 'Citas', icon: 'event_available', roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  { path: '/admin/calendario', label: 'Calendario', icon: 'calendar_month', roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  { path: '/admin/materiales', label: 'Materiales', icon: 'category', roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  { path: '/admin/pagos', label: 'Pagos y Saldos', icon: 'payments', roles: ['ADMIN', 'RECEPCION'] },
  { path: '/admin/caja-diaria', label: 'Caja Diaria', icon: 'point_of_sale', badge: computed(() => store.cashRegister.estado === 'ABIERTA' ? 'Activa' : 'Cerrada'), roles: ['ADMIN', 'RECEPCION'] },
  { path: '/admin/contenido', label: 'Contenido Web', icon: 'auto_stories', roles: ['ADMIN'] },
  { path: '/admin/usuarios', label: 'Usuarios y Roles', icon: 'manage_accounts', roles: ['ADMIN'] },
  { path: '/admin/mensajes', label: 'Mensajes Web', icon: 'chat', badge: computed(() => store.unreadMessagesCount > 0 ? store.unreadMessagesCount : undefined), roles: ['ADMIN'] },
];

const visibleNavItems = computed(() => {
  return navItems.filter((item) => item.roles.includes(currentRole.value));
});
</script>

<template>
  <div>
    <!-- Mobile backdrop -->
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden"
    ></div>

    <aside
      class="fixed top-0 bottom-0 left-0 w-72 bg-[#f8f3ea] border-r border-[#e7e2d9] shadow-md z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-300 lg:translate-x-0"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col">
        <!-- Header -->
        <div class="p-5 pb-3 flex items-center justify-between border-b border-[#ece8df]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#00685d] flex items-center justify-center text-white shadow-xs">
              <span class="material-symbols-outlined text-2xl">hearing</span>
            </div>
            <div>
              <h2 class="font-heading font-bold text-base text-[#00685d] leading-tight">
                Centro Armonía
              </h2>
              <p class="text-xs text-[#3d4947] font-semibold">SIGCA Clínico (Vue)</p>
            </div>
          </div>

          <button
            @click="emit('close')"
            class="lg:hidden p-1 rounded-lg text-[#3d4947] hover:bg-[#e7e2d9]"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Role selector switcher -->
        <div class="px-5 py-3 bg-[#f2ede4] border-b border-[#ece8df]">
          <label class="block text-[11px] font-bold text-[#6d7a77] uppercase tracking-wider mb-1">
            Modo de Acceso / Rol Activo
          </label>
          <div class="relative">
            <select
              :value="currentRole"
              @change="handleRoleChange"
              class="w-full appearance-none bg-white text-xs font-semibold text-[#1d1c16] py-2 pl-3 pr-8 rounded-xl border border-[#bcc9c6] focus:outline-none focus:ring-2 focus:ring-[#00685d] cursor-pointer"
            >
              <option v-if="store.currentUser?.role === 'ADMIN'" value="ADMIN">Administrador General</option>
              <option v-if="store.currentUser?.role === 'ADMIN'" value="RECEPCION">Recepción y Caja</option>
              <option v-if="store.currentUser?.role === 'ADMIN'" value="PROFESIONAL">Terapeuta / Profesional</option>
              <option v-if="store.currentUser?.role !== 'ADMIN'" :value="store.currentUser?.role">{{ store.currentUser?.role === 'RECEPCION' ? 'Recepción y Caja' : 'Terapeuta / Profesional' }}</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#6d7a77]">
              unfold_more
            </span>
          </div>
          <div class="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#00685d] font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00685d]"></span>
            <span>Conectado: {{ store.currentUser?.name }}</span>
          </div>
        </div>

        <!-- Navigation Items -->
        <div class="px-4 py-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#6d7a77] px-2 block mb-1">
            Navegación del Sistema
          </span>
          <nav class="space-y-1">
            <router-link
              v-for="item in visibleNavItems"
              :key="item.path"
              :to="item.path"
              @click="emit('close')"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              :class="route.path === item.path ? 'bg-[#00685d] text-white shadow-xs' : 'text-[#3d4947] hover:bg-[#e7e2d9] hover:text-[#1d1c16]'"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </div>

              <span
                v-if="item.badge?.value !== undefined"
                class="px-2 py-0.5 rounded-full text-[11px] font-bold"
                :class="route.path === item.path ? 'bg-white text-[#00685d]' : typeof item.badge.value === 'number' ? 'bg-[#a33d23] text-white' : item.badge.value === 'Activa' ? 'bg-[#00685d]/20 text-[#00685d]' : 'bg-[#6d7a77]/20 text-[#6d7a77]'"
              >
                {{ item.badge.value }}
              </span>
            </router-link>
          </nav>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="p-4 bg-[#f2ede4] border-t border-[#ece8df] space-y-2">
        <router-link
          to="/inicio"
          class="w-full py-2.5 px-3 bg-white hover:bg-[#ece8df] border border-[#bcc9c6] text-[#00685d] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">public</span>
          <span>Ver Portal Público</span>
        </router-link>

        <div class="px-1 text-[11px] text-[#6d7a77] flex items-center justify-between">
          <span>SIGCA v2.4 (Vue 3 + Pinia)</span>
          <span class="font-semibold text-[#00685d]">SAT-FEL OK</span>
        </div>
      </div>
    </aside>
  </div>
</template>
