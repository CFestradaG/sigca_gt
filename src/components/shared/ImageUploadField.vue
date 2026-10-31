<script setup lang="ts">
import { ref } from 'vue';
import { imageFileToDataUrl } from '../../utils/imageUpload';

const props = defineProps<{ modelValue: string; label: string; alt: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();
const error = ref('');
const isProcessing = ref(false);

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  error.value = '';
  isProcessing.value = true;
  try {
    emit('update:modelValue', await imageFileToDataUrl(file));
  } catch (err: any) {
    error.value = err?.message || 'No se pudo cargar la imagen.';
  } finally {
    isProcessing.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div class="space-y-2">
    <label class="block font-bold text-[#1d1c16]">{{ label }}</label>
    <div class="flex items-center gap-3">
      <img
        v-if="props.modelValue"
        :src="props.modelValue"
        :alt="props.alt"
        class="w-16 h-16 rounded-xl object-cover border border-[#bcc9c6]"
      />
      <div v-else class="w-16 h-16 rounded-xl bg-[#f2ede4] flex items-center justify-center text-[#6d7a77]">
        <span class="material-symbols-outlined text-2xl">person</span>
      </div>
      <label class="px-3 py-2 rounded-xl bg-[#f2ede4] text-[#00685d] font-bold cursor-pointer hover:bg-[#ece8df]">
        {{ isProcessing ? 'Procesando…' : 'Elegir imagen' }}
        <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" :disabled="isProcessing" @change="onFileChange" />
      </label>
      <button v-if="props.modelValue" type="button" class="text-[#a33d23] font-semibold" @click="emit('update:modelValue', '')">Quitar</button>
    </div>
    <p class="text-[10px] text-[#6d7a77]">JPG, PNG o WebP. Se comprime a un máximo de 600 KB para guardarla en MongoDB.</p>
    <p v-if="error" role="alert" class="text-[11px] text-[#a33d23]">{{ error }}</p>
  </div>
</template>
