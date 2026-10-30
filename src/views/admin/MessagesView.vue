<script setup lang="ts">
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const markAsRead = (id: string) => {
  store.markMessageRead(id);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Mensajes de Contacto Web
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Consultas recibidas directamente desde el formulario de contacto del portal público.
        </p>
      </div>
      <div v-if="store.unreadMessagesCount > 0" class="px-3 py-1.5 rounded-full bg-[#ffdad2] text-[#a33d23] text-xs font-bold">
        {{ store.unreadMessagesCount }} mensaje(s) nuevo(s)
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-if="store.messages.length === 0"
        class="p-12 text-center bg-white rounded-2xl border border-[#e7e2d9] text-xs text-[#6d7a77]"
      >
        No hay mensajes recibidos aún.
      </div>

      <div
        v-for="m in store.messages"
        :key="m.id"
        class="p-6 rounded-2xl border transition-all"
        :class="m.leido ? 'bg-white border-[#e7e2d9]' : 'bg-[#fef9f0] border-[#00685d]/40 shadow-xs'"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ece8df] pb-3 mb-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-heading font-bold text-base text-[#1d1c16]">{{ m.nombre }}</h3>
              <span
                v-if="!m.leido"
                class="px-2 py-0.5 rounded-full bg-[#ffdad2] text-[#a33d23] text-[10px] font-bold"
              >
                Nuevo
              </span>
            </div>
            <span class="text-xs text-[#6d7a77]">{{ m.email }} • {{ m.telefono || 'Sin teléfono' }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[11px] text-[#6d7a77]">{{ m.fecha }}</span>
            <button
              v-if="!m.leido"
              @click="markAsRead(m.id)"
              class="px-3 py-1 bg-[#00685d] hover:bg-[#008376] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Marcar Leído
            </button>
          </div>
        </div>

        <div class="space-y-1 text-xs">
          <span class="font-bold text-[#00685d] block">{{ m.asunto }}</span>
          <p class="text-[#3d4947] leading-relaxed text-sm pt-1">{{ m.mensaje }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
