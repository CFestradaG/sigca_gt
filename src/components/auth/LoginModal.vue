<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/appStore';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const store = useAppStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    const success = await store.login(email.value, password.value);
    if (success) {
      emit('success');
      emit('close');
    } else {
      errorMessage.value = store.lastAuthError || 'Credenciales inválidas';
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Error de conexión con el servidor';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"></div>

    <!-- Modal Card -->
    <div
      class="relative w-full max-w-lg bg-[#fef9f0] rounded-3xl shadow-2xl border border-[#e7e2d9] overflow-hidden z-10"
    >
      <!-- Header -->
      <div class="p-6 bg-gradient-to-r from-[#00685d] to-[#008376] text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div>
            <h3 class="font-heading font-bold text-xl text-white">Acceso al Sistema SIGCA</h3>
            <p class="text-xs text-white/80">Acceso exclusivo para personal autorizado</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-4 rounded-2xl bg-[#ffdad2] border border-[#ffb4a2] text-[#731a04] text-xs font-semibold flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-lg">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-[#3d4947] mb-1">Correo Electrónico Institucional</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6d7a77]">
                mail
              </span>
              <input
                v-model="email"
                type="email"
                required
                placeholder="ejemplo@centroarmonia.com.gt"
                class="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#bcc9c6] text-sm text-[#1d1c16] focus:outline-none focus:ring-2 focus:ring-[#00685d]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#3d4947] mb-1">Contraseña</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6d7a77]">
                key
              </span>
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-[#bcc9c6] text-sm text-[#1d1c16] focus:outline-none focus:ring-2 focus:ring-[#00685d]"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-12 rounded-xl bg-[#00685d] hover:bg-[#00544a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span v-if="isLoading" class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            <span v-else class="material-symbols-outlined text-xl">login</span>
            <span>{{ isLoading ? 'Verificando con API...' : 'Ingresar al Portal' }}</span>
          </button>
        </form>

        <p class="pt-4 border-t border-[#e7e2d9] text-[11px] text-[#6d7a77]">
          Si necesita acceso, solicítelo a la administración del centro.
        </p>
      </div>
    </div>
  </div>
</template>
