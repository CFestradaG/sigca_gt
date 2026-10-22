<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  asunto: '',
  mensaje: '',
});

const submitted = ref(false);
const errorMsg = ref('');

const handleSubmit = () => {
  if (!form.value.nombre.trim() || !form.value.email.trim() || !form.value.mensaje.trim()) {
    errorMsg.value = 'Por favor complete su nombre, correo electrónico y mensaje.';
    return;
  }
  errorMsg.value = '';
  store.submitContactMessage({
    nombre: form.value.nombre.trim(),
    email: form.value.email.trim(),
    telefono: form.value.telefono.trim(),
    asunto: form.value.asunto.trim() || 'Consulta general',
    mensaje: form.value.mensaje.trim(),
  });
  submitted.value = true;
  form.value = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };
};
</script>

<template>
  <div class="py-12 bg-[#fef9f0]">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#00685d]">
          Ubicación y Atención
        </span>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-[#1d1c16]">
          Horarios de Atención y Contacto
        </h1>
        <p class="text-base text-[#3d4947]">
          Estamos a su disposición en dos ubicaciones accesibles de la Ciudad de Guatemala.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Sedes & Hours (Col 5) -->
        <div class="lg:col-span-5 space-y-6">
          <!-- General Hours Card -->
          <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#e7e2d9] space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#00685d]/10 text-[#00685d] flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <h3 class="font-heading font-bold text-lg text-[#1d1c16]">Horarios de Consulta</h3>
            </div>

            <div class="space-y-3 text-sm text-[#3d4947] divide-y divide-[#ece8df]">
              <div class="pt-2 flex justify-between items-center">
                <span class="font-semibold text-[#1d1c16]">Lunes a Viernes:</span>
                <span class="font-bold text-[#00685d]">{{ store.content.horariosSemana.replace('Lunes a Viernes: ', '') }}</span>
              </div>
              <div class="pt-3 flex justify-between items-center">
                <span class="font-semibold text-[#1d1c16]">Sábados:</span>
                <span class="font-bold text-[#00685d]">{{ store.content.horariosSabado.replace('Sábados: ', '') }}</span>
              </div>
              <div class="pt-3 flex justify-between items-center">
                <span class="font-semibold text-[#1d1c16]">Domingos y Asuetos:</span>
                <span class="text-[#a33d23] font-medium">Cerrado (Emergencias coordinadas)</span>
              </div>
            </div>
          </div>

          <!-- Locations -->
          <div
            v-for="sede in store.content.sedes"
            :key="sede.id"
            class="bg-white p-6 rounded-2xl shadow-sm border border-[#e7e2d9] space-y-3"
          >
            <div class="flex items-center gap-2 text-[#00685d]">
              <span class="material-symbols-outlined text-xl">location_on</span>
              <h4 class="font-heading font-bold text-base text-[#1d1c16]">{{ sede.nombre }}</h4>
            </div>
            <p class="text-xs text-[#3d4947] leading-relaxed pl-7">
              {{ sede.direccion }}
            </p>
            <p class="text-xs font-semibold text-[#00685d] pl-7 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">call</span>
              <span>{{ sede.telefono }}</span>
            </p>
          </div>

          <!-- Quick Contact Box -->
          <div class="p-6 bg-[#f8f3ea] rounded-2xl border border-[#bcc9c6] space-y-2 text-xs text-[#3d4947]">
            <p class="font-bold text-sm text-[#1d1c16]">¿Necesita asistencia inmediata?</p>
            <p>Comuníquese a nuestra central de recepción o envíenos un mensaje por WhatsApp al <strong>{{ store.content.whatsapp }}</strong>.</p>
          </div>
        </div>

        <!-- Contact Form (Col 7) -->
        <div class="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-[#e7e2d9]">
          <div class="space-y-2 mb-6">
            <h3 class="font-heading font-bold text-2xl text-[#1d1c16]">
              Envíenos un Mensaje
            </h3>
            <p class="text-sm text-[#3d4947]">
              Complete el formulario a continuación y nuestro equipo administrativo se pondrá en contacto con usted en un plazo no mayor a 24 horas hábiles.
            </p>
          </div>

          <div v-if="submitted" class="p-6 rounded-2xl bg-[#00685d]/10 border border-[#00685d]/30 text-center space-y-3">
            <span class="material-symbols-outlined text-5xl text-[#00685d]">check_circle</span>
            <h4 class="font-heading font-bold text-lg text-[#1d1c16]">¡Mensaje Recibido!</h4>
            <p class="text-sm text-[#3d4947]">
              Gracias por escribir a Centro Armonía. Su consulta fue guardada exitosamente y ha sido asignada a nuestra mesa de atención.
            </p>
            <button
              @click="submitted = false"
              class="mt-3 px-5 py-2 bg-[#00685d] text-white text-xs font-bold rounded-xl hover:bg-[#008376] cursor-pointer"
            >
              Enviar otro mensaje
            </button>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="space-y-4">
            <div v-if="errorMsg" class="p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
              {{ errorMsg }}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#1d1c16] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  v-model="form.nombre"
                  placeholder="Ej. Carmen Sandoval"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#1d1c16] mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  v-model="form.email"
                  placeholder="carmen@ejemplo.com"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#1d1c16] mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  v-model="form.telefono"
                  placeholder="+502 5555-1234"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#1d1c16] mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  v-model="form.asunto"
                  placeholder="Ej. Consulta sobre costo de evaluación"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-[#1d1c16] mb-1">
                Mensaje o Consulta Detallada *
              </label>
              <textarea
                rows="4"
                required
                v-model="form.mensaje"
                placeholder="Escriba aquí los detalles de su consulta, edad del paciente y dudas..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full py-3.5 bg-[#00685d] hover:bg-[#008376] text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">send</span>
              <span>Enviar Mensaje a Recepción</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
