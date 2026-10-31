<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAppStore } from '../../stores/appStore';
import { computed } from 'vue';

const store = useAppStore();
const route = useRoute();
const hasPortalAccess = computed(() =>
  store.authReady &&
  store.currentUser?.active === true &&
  ['ADMIN', 'RECEPCION', 'PROFESIONAL'].includes(store.currentUser.role)
);

const emit = defineEmits<{
  (e: 'openLogin'): void;
}>();

const navItems = [
  { path: '/inicio', label: 'Inicio' },
  { path: '/servicios', label: 'Servicios y Tratamientos' },
  { path: '/mision-vision', label: 'Misión y Visión' },
  { path: '/educativo', label: 'Contenido Educativo' },
  { path: '/corporativo', label: 'Corporativo' },
  { path: '/horarios-contacto', label: 'Horarios y Contacto' },
];
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#fef9f0]/95 backdrop-blur-md border-b border-[#e7e2d9] shadow-xs">
    <!-- Top Banner -->
    <div class="bg-[#f8f3ea] px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between text-[#3d4947] text-xs border-b border-[#ece8df]">
      <div className="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <span class="material-symbols-outlined text-[15px] text-[#00685d]">location_on</span>
          <span>Zona 10 Sixtino II • Zona 14 Europlaza, Guatemala</span>
        </span>
        <span class="hidden md:inline-block text-[#bcc9c6]">|</span>
        <span class="hidden md:flex items-center gap-1 font-medium text-[#00685d]">
          <span class="material-symbols-outlined text-[15px]">verified</span>
          <span>Centro Certificado en Terapia Auditivo-Verbal y Salud Mental</span>
        </span>
      </div>
      <div class="flex items-center gap-4 ml-auto font-medium">
        <a
          :href="`tel:${store.content.telefonoPBX.replace(/[^0-9+]/g, '')}`"
          class="flex items-center gap-1 hover:text-[#00685d] transition-colors"
        >
          <span class="material-symbols-outlined text-[15px] text-[#00685d]">call</span>
          <span>PBX: {{ store.content.telefonoPBX }}</span>
        </a>
        <span class="hidden sm:inline-block text-[#bcc9c6]">|</span>
        <span class="hidden sm:inline text-[#2f4a5d]">{{ store.content.horariosSemana }}</span>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
      <!-- Brand -->
      <router-link
        to="/inicio"
        class="flex items-center gap-3 text-left group cursor-pointer"
      >
        <div class="w-11 h-11 rounded-xl bg-[#00685d] text-white flex items-center justify-center shadow-sm group-hover:bg-[#008376] transition-colors">
          <span class="material-symbols-outlined text-2xl">hearing</span>
        </div>
        <div class="flex flex-col">
          <span class="font-heading font-bold text-xl text-[#00685d] tracking-tight group-hover:text-[#008376] transition-colors">
            {{ store.content.centroNombre }}
          </span>
          <span class="text-xs text-[#3d4947] font-medium tracking-wide">
            Psicología • Estimulación Auditivo-Verbal
          </span>
        </div>
      </router-link>

      <!-- Center Nav Links -->
      <nav class="hidden xl:flex items-center gap-6">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="py-1 text-sm font-semibold transition-all cursor-pointer"
          :class="route.path === item.path ? 'text-[#00685d] border-b-2 border-[#00685d]' : 'text-[#3d4947] hover:text-[#00685d]'"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <!-- Right CTA Actions -->
      <div class="flex items-center gap-3">
        <router-link
          to="/agendar-cita"
          class="inline-flex items-center gap-2 bg-[#a33d23] text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm hover:bg-[#83260e] transition-all cursor-pointer active:scale-95"
        >
          <span class="material-symbols-outlined text-lg">calendar_today</span>
          <span>Agendar Cita (Q)</span>
        </router-link>

        <!-- Iniciar Sesión modal trigger -->
        <button
          v-if="store.authReady && !store.currentUser"
          @click="emit('openLogin')"
          type="button"
          class="inline-flex items-center gap-1.5 bg-white hover:bg-[#ece8df] text-[#00685d] text-sm font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-[#bcc9c6]"
        >
          <span class="material-symbols-outlined text-lg">login</span>
          <span class="hidden md:inline">Iniciar Sesión</span>
        </button>

        <!-- Quick link to Admin Portal -->
        <button
          v-else-if="store.authReady && store.currentUser"
          @click="store.logout()"
          type="button"
          title="Cerrar sesión"
          class="inline-flex items-center gap-1.5 bg-white hover:bg-[#ece8df] text-[#00685d] text-sm font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-[#bcc9c6]"
        >
          <span class="material-symbols-outlined text-lg">logout</span>
          <span class="hidden md:inline">Cerrar sesión</span>
        </button>

        <router-link
          v-if="hasPortalAccess"
          to="/admin/dashboard"
          :title="`Portal SIGCA · ${store.currentUser?.role}`"
          class="inline-flex items-center gap-1.5 bg-[#f2ede4] hover:bg-[#ece8df] text-[#00685d] text-sm font-semibold px-3 py-2.5 rounded-xl transition-all cursor-pointer border border-[#bcc9c6]"
        >
          <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
          <span class="hidden md:inline">Portal SIGCA</span>
        </router-link>
      </div>
    </div>

    <!-- Mobile Horizontal Sub-menu -->
    <div class="xl:hidden bg-[#f8f3ea] px-4 py-2 border-t border-[#e7e2d9] overflow-x-auto flex gap-4 no-scrollbar">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="whitespace-nowrap text-xs font-semibold px-2 py-1 rounded-lg"
        :class="route.path === item.path ? 'bg-[#00685d] text-white' : 'text-[#3d4947] hover:bg-[#ece8df]'"
      >
        {{ item.label }}
      </router-link>
    </div>
  </header>
</template>
