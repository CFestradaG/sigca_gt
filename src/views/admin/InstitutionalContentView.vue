<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const form = ref({
  centroNombre: store.content.centroNombre,
  slogan: store.content.slogan,
  telefonoPBX: store.content.telefonoPBX,
  whatsapp: store.content.whatsapp,
  emailContacto: store.content.emailContacto,
  mision: store.content.mision,
  vision: store.content.vision,
  horariosSemana: store.content.horariosSemana,
  horariosSabado: store.content.horariosSabado,
});

const savedSuccess = ref(false);

const handleSave = () => {
  store.updateInstitutionalContent({
    ...form.value,
  });
  savedSuccess.value = true;
  setTimeout(() => {
    savedSuccess.value = false;
  }, 3000);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Administración del Contenido Institucional
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Edición directa de textos, misión, visión, números de contacto y horarios del portal público (RF-01 / RF-13).
        </p>
      </div>

      <div
        v-if="savedSuccess"
        class="px-4 py-2 bg-[#8cf5e4] text-[#005048] rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse"
      >
        <span class="material-symbols-outlined text-base">check_circle</span>
        <span>¡Cambios guardados y publicados!</span>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Basic Brand Identity -->
      <div class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-4">
        <h3 class="font-heading font-bold text-base text-[#1d1c16] flex items-center gap-2">
          <span class="material-symbols-outlined text-[#00685d]">branding_watermark</span>
          <span>Identidad y Nombre del Centro (RF-01)</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Nombre del Centro *</label>
            <input
              type="text"
              required
              v-model="form.centroNombre"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs font-bold text-[#00685d] focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Lema / Slogan</label>
            <input
              type="text"
              v-model="form.slogan"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Teléfono PBX Principal</label>
            <input
              type="text"
              v-model="form.telefonoPBX"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">WhatsApp de Atención</label>
            <input
              type="text"
              v-model="form.whatsapp"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Correo Electrónico Oficial</label>
            <input
              type="email"
              v-model="form.emailContacto"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>
        </div>
      </div>

      <!-- Misión y Visión -->
      <div class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-4">
        <h3 class="font-heading font-bold text-base text-[#1d1c16] flex items-center gap-2">
          <span class="material-symbols-outlined text-[#00685d]">visibility</span>
          <span>Misión y Visión Institucional (RF-01)</span>
        </h3>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Misión</label>
            <textarea
              rows="3"
              v-model="form.mision"
              class="w-full p-3 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Visión</label>
            <textarea
              rows="3"
              v-model="form.vision"
              class="w-full p-3 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Horarios -->
      <div class="bg-white p-6 rounded-2xl border border-[#e7e2d9] shadow-xs space-y-4">
        <h3 class="font-heading font-bold text-base text-[#1d1c16] flex items-center gap-2">
          <span class="material-symbols-outlined text-[#00685d]">schedule</span>
          <span>Horarios de Atención al Público</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Horario Lunes a Viernes</label>
            <input
              type="text"
              v-model="form.horariosSemana"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Horario Sábados</label>
            <input
              type="text"
              v-model="form.horariosSabado"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>
        </div>
      </div>

      <!-- Submit button -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="px-6 py-3 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">save</span>
          <span>Guardar Cambios Institucionales</span>
        </button>
      </div>
    </form>
  </div>
</template>
