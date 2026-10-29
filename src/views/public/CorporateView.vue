<script setup lang="ts">
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
</script>

<template>
  <div class="py-12 bg-[#fef9f0]">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#a33d23]">
          Área Institucional y Comunitaria
        </span>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-[#1d1c16]">
          Capacitaciones y Escuela para Padres
        </h1>
        <p class="text-base text-[#3d4947]">
          Fortalecemos a colegios, docentes, equipos de salud y familias con herramientas prácticas para la inclusión y el neurodesarrollo.
        </p>
      </div>

      <!-- Corporate Activities Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="act in store.content.actividades"
          :key="act.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[#e7e2d9] flex flex-col justify-between"
        >
          <div>
            <div class="h-48 relative overflow-hidden">
              <img
                :src="act.imagenUrl"
                :alt="act.titulo"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-3 left-3 bg-[#a33d23] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                {{ act.tipo }}
              </div>
            </div>

            <div class="p-6 space-y-3">
              <div v-if="act.fecha" class="flex items-center gap-1.5 text-xs font-semibold text-[#00685d]">
                <span class="material-symbols-outlined text-sm">event</span>
                <span>{{ act.fecha }}</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#1d1c16] leading-snug">
                {{ act.titulo }}
              </h3>
              <p class="text-sm text-[#3d4947] leading-relaxed">
                {{ act.descripcion }}
              </p>
            </div>
          </div>

          <div class="p-6 pt-0">
            <router-link
              to="/horarios-contacto"
              class="w-full py-2.5 bg-[#f2ede4] hover:bg-[#ece8df] text-[#00685d] border border-[#bcc9c6] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span class="material-symbols-outlined text-sm">mail</span>
              <span>Solicitar Información o Cupo</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Institutional Alliance Callout -->
      <div class="bg-[#f8f3ea] p-8 sm:p-10 rounded-2xl border border-[#e7e2d9] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-8 space-y-3">
          <h3 class="font-heading font-bold text-2xl text-[#1d1c16]">
            ¿Representa a un centro educativo o institución en Guatemala?
          </h3>
          <p class="text-sm text-[#3d4947] leading-relaxed">
            Diseñamos talleres a la medida para su claustro docente sobre adecuaciones curriculares, tecnologías de audición asistida (FM/Roger) y manejo conductual en el aula.
          </p>
        </div>
        <div class="lg:col-span-4 text-left lg:text-right">
          <router-link
            to="/horarios-contacto"
            class="px-6 py-3.5 bg-[#00685d] hover:bg-[#008376] text-white font-semibold rounded-xl text-sm shadow-sm transition-colors cursor-pointer inline-block"
          >
            Contactar Dirección Académica
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
