<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
const selectedCategory = ref('TODAS');

const categories = ['TODAS', 'Estimulación Auditiva', 'Psicología', 'Lenguaje', 'Evaluación Integral'];

const filteredServices = computed(() => {
  return store.services
    .filter((s) => s.estado === 'ACTIVO')
    .filter((s) => (selectedCategory.value === 'TODAS' ? true : s.categoria === selectedCategory.value));
});
</script>

<template>
  <div class="py-12 bg-[#fef9f0]">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#a33d23]">
          Catálogo Terapéutico
        </span>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-[#1d1c16]">
          Servicios Clínicos, Tarifas y Tratamientos
        </h1>
        <p class="text-base text-[#3d4947]">
          Intervención basada en evidencia con terapeutas certificados. Todos nuestros precios están expresados en Quetzales (Q).
        </p>
      </div>

      <!-- Categories Bar -->
      <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          :class="selectedCategory === cat ? 'bg-[#00685d] text-white shadow-xs' : 'bg-white text-[#3d4947] hover:bg-[#ece8df] border border-[#e7e2d9]'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="srv in filteredServices"
          :key="srv.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-[#e7e2d9] flex flex-col justify-between"
        >
          <div>
            <div class="h-52 relative overflow-hidden">
              <img
                :src="srv.imagenUrl"
                :alt="srv.nombre"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-3 left-3 bg-[#00685d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                {{ srv.categoria }}
              </div>
              <div class="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#1d1c16] border border-[#bcc9c6] flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">schedule</span>
                <span>{{ srv.duracionMinutos }} min</span>
              </div>
            </div>

            <div class="p-6 space-y-3">
              <h3 class="font-heading font-bold text-xl text-[#1d1c16] leading-snug">
                {{ srv.nombre }}
              </h3>
              <p class="text-sm text-[#3d4947] leading-relaxed">
                {{ srv.descripcion }}
              </p>
            </div>
          </div>

          <div class="p-6 pt-0">
            <div class="p-4 bg-[#f8f3ea] rounded-xl flex items-center justify-between border border-[#ece8df]">
              <div>
                <span class="text-xs text-[#6d7a77] block font-medium">Inversión por sesión</span>
                <span class="text-2xl font-extrabold text-[#00685d]">
                  Q {{ srv.precioQ.toFixed(2) }}
                </span>
              </div>

              <router-link
                to="/agendar-cita"
                class="px-4 py-2.5 bg-[#a33d23] hover:bg-[#83260e] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-base">calendar_month</span>
                <span>Solicitar Cita</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Informative Note -->
      <div class="p-6 bg-[#f8f3ea] rounded-2xl border border-[#bcc9c6] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[#00685d] text-3xl">receipt_long</span>
          <div>
            <h4 class="font-heading font-bold text-sm text-[#1d1c16]">Emisión de Comprobantes SAT-FEL</h4>
            <p class="text-xs text-[#3d4947]">Todas nuestras consultas emiten comprobante oficial para reclamo de seguro de gastos médicos mayores.</p>
          </div>
        </div>
        <router-link
          to="/horarios-contacto"
          class="whitespace-nowrap px-4 py-2 bg-white text-[#00685d] border border-[#00685d] rounded-xl text-xs font-bold hover:bg-[#f2ede4] transition-colors cursor-pointer"
        >
          Preguntar por Aseguradoras
        </router-link>
      </div>
    </div>
  </div>
</template>
