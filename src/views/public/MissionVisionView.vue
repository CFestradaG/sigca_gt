<script setup lang="ts">
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
</script>

<template>
  <div class="py-12 bg-[#fef9f0]">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#00685d]">
          Identidad y Propósito
        </span>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-[#1d1c16]">
          Misión, Visión y Principios Institucionales
        </h1>
        <p class="text-base text-[#3d4947]">
          Guiados por la empatía, el rigor científico y el compromiso incondicional con cada familia.
        </p>
      </div>

      <!-- Mission & Vision Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Mision -->
        <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-[#e7e2d9] flex flex-col justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#00685d]/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div class="w-14 h-14 rounded-2xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-3xl">flag</span>
            </div>
            <span class="text-xs font-bold uppercase tracking-wider text-[#00685d]">Nuestra Misión</span>
            <h2 class="font-heading font-bold text-2xl text-[#1d1c16] mt-2 mb-4">
              Construir puentes para la comunicación y el bienestar emocional
            </h2>
            <p class="text-base text-[#3d4947] leading-relaxed">
              {{ store.content.mision }}
            </p>
          </div>
          <div class="pt-8 border-t border-[#ece8df] mt-8 flex items-center gap-2 text-xs font-bold text-[#00685d]">
            <span class="material-symbols-outlined text-base">check_circle</span>
            <span>Enfoque centrado en la familia y evidencia clínica</span>
          </div>
        </div>

        <!-- Vision -->
        <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-[#e7e2d9] flex flex-col justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#a33d23]/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div class="w-14 h-14 rounded-2xl bg-[#a33d23]/10 text-[#a33d23] flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-3xl">visibility</span>
            </div>
            <span class="text-xs font-bold uppercase tracking-wider text-[#a33d23]">Nuestra Visión</span>
            <h2 class="font-heading font-bold text-2xl text-[#1d1c16] mt-2 mb-4">
              Liderazgo e innovación terapéutica en Centroamérica
            </h2>
            <p class="text-base text-[#3d4947] leading-relaxed">
              {{ store.content.vision }}
            </p>
          </div>
          <div class="pt-8 border-t border-[#ece8df] mt-8 flex items-center gap-2 text-xs font-bold text-[#a33d23]">
            <span class="material-symbols-outlined text-base">stars</span>
            <span>Certificación continua y calidez humana</span>
          </div>
        </div>
      </div>

      <!-- Pillars -->
      <div class="bg-[#f8f3ea] rounded-2xl p-8 sm:p-12 border border-[#e7e2d9] space-y-8">
        <div class="text-center max-w-2xl mx-auto">
          <h3 class="font-heading font-bold text-2xl text-[#1d1c16]">Nuestros Pilares Terapéuticos</h3>
          <p class="text-sm text-[#3d4947] mt-1">Cómo llevamos nuestra misión a cada sesión clínica diaria</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl border border-[#ece8df] space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
              <span class="material-symbols-outlined">hearing</span>
            </div>
            <h4 class="font-heading font-bold text-base text-[#1d1c16]">Audición Funcional</h4>
            <p class="text-xs text-[#3d4947] leading-relaxed">
              Maximizar la estimulación del cortex auditivo en ventanas críticas de neuroplasticidad infantil.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl border border-[#ece8df] space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#a33d23]/10 text-[#a33d23] flex items-center justify-center">
              <span class="material-symbols-outlined">diversity_1</span>
            </div>
            <h4 class="font-heading font-bold text-base text-[#1d1c16]">Inclusión Familiar</h4>
            <p class="text-xs text-[#3d4947] leading-relaxed">
              Los padres son los terapeutas principales del día a día; los capacitamos con técnicas comprobadas.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl border border-[#ece8df] space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[#455f73]/10 text-[#455f73] flex items-center justify-center">
              <span class="material-symbols-outlined">psychology</span>
            </div>
            <h4 class="font-heading font-bold text-base text-[#1d1c16]">Salud Emocional</h4>
            <p class="text-xs text-[#3d4947] leading-relaxed">
              Cuidado integral de la autoestima, la resiliencia y el bienestar psicológico en la infancia y adolescencia.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center pt-4">
        <router-link
          to="/servicios"
          class="px-6 py-3 bg-[#00685d] text-white font-semibold rounded-xl text-sm hover:bg-[#008376] transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <span>Conozca cómo aplicamos estos valores en nuestros servicios</span>
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </router-link>
      </div>
    </div>
  </div>
</template>
