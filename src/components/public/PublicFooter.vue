<script setup lang="ts">
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();
</script>

<template>
  <footer class="bg-[#1d1c16] text-[#e7e2d9] pt-14 pb-8 border-t border-[#3d4947]">
    <div class="max-w-7xl mx-auto px-4 sm:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3d4947]/60">
        <!-- Col 1: Identity -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#00685d] text-white flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">hearing</span>
            </div>
            <span class="font-heading font-bold text-xl text-white">
              {{ store.content.centroNombre }}
            </span>
          </div>
          <p class="text-sm text-[#ded9d1] leading-relaxed">
            Atención integral en psicología del desarrollo y estimulación auditivo-verbal con enfoque en la familia. Certificados y comprometidos con el futuro de cada paciente.
          </p>
          <div class="flex items-center gap-3 pt-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00685d]/30 text-[#8cf5e4] text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-[#8cf5e4] animate-pulse"></span>
              Guatemala, C.A.
            </span>
          </div>
        </div>

        <!-- Col 2: Sedes y Horarios -->
        <div class="space-y-4">
          <h4 class="font-heading font-bold text-base text-white tracking-wide uppercase text-xs">
            Sedes de Atención
          </h4>
          <div class="space-y-3 text-sm text-[#ded9d1]">
            <div>
              <p class="font-semibold text-white">Sede Zona 10 (Sixtino II)</p>
              <p class="text-xs text-[#bcc9c6]">6a Av 6-63 Zona 10, Edificio Sixtino II, Nivel 7, Of. 704</p>
            </div>
            <div>
              <p class="font-semibold text-white">Sede Zona 14 (Europlaza)</p>
              <p class="text-xs text-[#bcc9c6]">5a Av 5-55 Zona 14, Edificio Europlaza Torre 2, Nivel 4</p>
            </div>
            <div class="pt-2">
              <p class="text-xs text-[#8cf5e4] font-medium">{{ store.content.horariosSemana }}</p>
              <p class="text-xs text-[#8cf5e4] font-medium">{{ store.content.horariosSabado }}</p>
            </div>
          </div>
        </div>

        <!-- Col 3: Enlaces Rápidos -->
        <div class="space-y-4">
          <h4 class="font-heading font-bold text-base text-white tracking-wide uppercase text-xs">
            Navegación
          </h4>
          <ul class="space-y-2 text-sm text-[#ded9d1]">
            <li>
              <router-link to="/inicio" class="hover:text-[#8cf5e4] transition-colors">
                Inicio
              </router-link>
            </li>
            <li>
              <router-link to="/servicios" class="hover:text-[#8cf5e4] transition-colors">
                Servicios y Tarifas
              </router-link>
            </li>
            <li>
              <router-link to="/mision-vision" class="hover:text-[#8cf5e4] transition-colors">
                Misión y Visión
              </router-link>
            </li>
            <li>
              <router-link to="/educativo" class="hover:text-[#8cf5e4] transition-colors">
                Contenido Educativo para Familias
              </router-link>
            </li>
            <li>
              <router-link to="/corporativo" class="hover:text-[#8cf5e4] transition-colors">
                Escuela para Padres y Talleres
              </router-link>
            </li>
            <li>
              <router-link to="/agendar-cita" class="hover:text-[#ff8162] font-semibold transition-colors text-[#ffdad2]">
                Solicitar Cita en Línea
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Col 4: Contacto Inmediato -->
        <div class="space-y-4">
          <h4 class="font-heading font-bold text-base text-white tracking-wide uppercase text-xs">
            Contacto y Admisión
          </h4>
          <div class="space-y-2.5 text-sm text-[#ded9d1]">
            <p class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#8cf5e4] text-lg">call</span>
              <span>PBX: {{ store.content.telefonoPBX }}</span>
            </p>
            <p class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#8cf5e4] text-lg">chat</span>
              <span>WhatsApp: {{ store.content.whatsapp }}</span>
            </p>
            <p class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#8cf5e4] text-lg">mail</span>
              <span>{{ store.content.emailContacto }}</span>
            </p>
          </div>
          <div class="pt-3">
            <router-link
              to="/admin/dashboard"
              class="w-full py-2.5 px-4 bg-[#32302a] hover:bg-[#3d4947] border border-[#6d7a77] rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">lock</span>
              <span>Acceso Interno de Personal (SIGCA)</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#ded9d1]/70 gap-3">
        <p>© {{ new Date().getFullYear() }} {{ store.content.centroNombre }} — Sistema Integral de Gestión de Citas y Atención (SIGCA). Todos los derechos reservados.</p>
        <p class="flex items-center gap-2">
          <span>Privacidad de Datos Clínicos</span>
          <span>•</span>
          <span>Normativa Sanitaria Guatemala</span>
        </p>
      </div>
    </div>
  </footer>
</template>
