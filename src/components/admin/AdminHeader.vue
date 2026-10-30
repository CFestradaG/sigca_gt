<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';
import ImageUploadField from '../shared/ImageUploadField.vue';

const emit = defineEmits<{
  (e: 'toggleSidebar'): void;
  (e: 'openLogin'): void;
}>();

const store = useAppStore();
const router = useRouter();
const showProfileEditor = ref(false);
const profileAvatar = ref('');
const profileError = ref('');
const savingProfile = ref(false);
function openProfileEditor() {
  profileAvatar.value = store.currentUser?.avatarUrl || '';
  profileError.value = '';
  showProfileEditor.value = true;
}

async function saveProfileAvatar() {
  savingProfile.value = true;
  profileError.value = '';
  try {
    await store.updateOwnAvatar(profileAvatar.value);
    showProfileEditor.value = false;
  } catch (err: any) {
    profileError.value = err?.message || 'No se pudo actualizar la foto de perfil.';
  } finally {
    savingProfile.value = false;
  }
}

const todayFormatted = new Date().toLocaleDateString('es-GT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
</script>

<template>
  <header class="sticky top-0 z-30 h-20 bg-[#fef9f0]/95 backdrop-blur-md border-b border-[#e7e2d9] px-4 sm:px-8 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <!-- Toggle sidebar button for mobile -->
      <button
        @click="emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-xl bg-white border border-[#bcc9c6] text-[#3d4947] hover:bg-[#f2ede4] cursor-pointer"
      >
        <span class="material-symbols-outlined text-xl">menu</span>
      </button>

      <!-- Sede selector -->
      <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2ede4] text-xs text-[#3d4947] border border-[#bcc9c6]">
        <span class="material-symbols-outlined text-[#a33d23] text-base">location_on</span>
        <span class="font-bold text-[#1d1c16]">Sede:</span>
        <select :value="store.selectedSite" @change="store.setSelectedSite(($event.target as HTMLSelectElement).value as any)" class="bg-transparent font-semibold text-[#1d1c16] focus:outline-none cursor-pointer">
          <option value="z10">Zona 10 - Pradera Sixtino II</option>
          <option value="z14">Zona 14 - Europlaza Las Conchas</option>
          <option value="online">En línea</option>
          <option value="todas">Todas las sedes</option>
        </select>
      </div>

    </div>

    <!-- Right User Meta -->
    <div class="flex items-center gap-4">
      <!-- Date in Guatemala -->
      <div class="hidden md:flex flex-col text-right">
        <span class="text-[11px] text-[#6d7a77] font-medium">Fecha en Guatemala</span>
        <span class="text-xs font-bold text-[#1d1c16] capitalize">
          {{ todayFormatted }}
        </span>
      </div>

      <div class="hidden md:block h-7 w-px bg-[#bcc9c6]/40"></div>

      <!-- User Card -->
      <button
        @click="openProfileEditor"
        type="button"
        title="Editar mi perfil"
        class="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-[#f2ede4] transition-colors cursor-pointer text-left"
      >
        <img
          v-if="store.currentUser?.avatarUrl"
          :src="store.currentUser.avatarUrl"
          :alt="store.currentUser.name"
          class="w-9 h-9 rounded-full object-cover ring-2 ring-[#00685d]/20"
        />
        <span v-else class="w-9 h-9 rounded-full bg-[#00685d] text-white ring-2 ring-[#00685d]/20 flex items-center justify-center text-xs font-bold">{{ store.currentUser?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') }}</span>
        <div class="hidden xl:flex flex-col text-left">
          <span class="text-xs font-bold text-[#1d1c16] leading-tight flex items-center gap-1">
            <span>{{ store.currentUser?.name }}</span>
            <span class="material-symbols-outlined text-[13px] text-[#6d7a77]">edit</span>
          </span>
          <span class="text-[11px] text-[#00685d] font-semibold leading-none">
            {{ store.currentUser?.role === 'ADMIN' ? 'Administrador General' : store.currentUser?.role === 'RECEPCION' ? 'Recepción y Caja' : 'Terapeuta Clínico' }}
          </span>
        </div>
      </button>

      <!-- Logout -->
      <button
        type="button"
        @click="store.logout(); router.push('/inicio')"
        title="Salir al portal público"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ffdad2] hover:bg-[#a33d23] text-[#731a04] hover:text-white transition-all text-xs font-bold cursor-pointer"
      >
        <span class="material-symbols-outlined text-base">logout</span>
        <span class="hidden sm:inline">Cerrar sesión</span>
      </button>
    </div>
  </header>

  <div v-if="showProfileEditor" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
      <h3 class="font-heading font-bold text-lg">Editar mi perfil</h3>
      <ImageUploadField v-model="profileAvatar" label="Foto de perfil" :alt="store.currentUser?.name || 'Usuario'" />
      <div v-if="profileError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">{{ profileError }}</div>
      <div class="flex justify-end gap-2">
        <button type="button" @click="showProfileEditor = false" class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold">Cancelar</button>
        <button type="button" :disabled="savingProfile" @click="saveProfileAvatar" class="px-4 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold disabled:opacity-50">{{ savingProfile ? 'Guardando…' : 'Guardar foto' }}</button>
      </div>
    </div>
  </div>
</template>
