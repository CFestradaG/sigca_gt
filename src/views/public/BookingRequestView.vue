<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

const activeServices = computed(() => store.services.filter((s) => s.estado === 'ACTIVO'));

const form = ref({
  solicitanteNombre: '',
  email: '',
  telefono: '',
  servicioId: activeServices.value[0]?.id || '',
  sedePreferida: 'Zona 10 - Sixtino II',
  fechaPreferida: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
  mensaje: '',
});

const submittedId = ref<string | null>(null);
const errorMsg = ref('');
const isSubmitting = ref(false);

const selectedService = computed(() => {
  return store.services.find((s) => s.id === form.value.servicioId) || activeServices.value[0];
});

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  if (!form.value.solicitanteNombre.trim() || !form.value.email.trim() || !form.value.telefono.trim()) {
    errorMsg.value = 'Por favor complete todos los datos de contacto obligatorios.';
    return;
  }
  errorMsg.value = '';
  isSubmitting.value = true;
  try {
    const request = await store.submitAppointmentRequest({
      solicitanteNombre: form.value.solicitanteNombre.trim(),
      email: form.value.email.trim(),
      telefono: form.value.telefono.trim(),
      servicioId: form.value.servicioId || activeServices.value[0]?.id || '',
      sedePreferida: form.value.sedePreferida,
      fechaPreferida: form.value.fechaPreferida,
      mensaje: form.value.mensaje.trim(),
    });
    submittedId.value = request.id;
  } catch (err: any) {
    errorMsg.value = err?.message || 'No se pudo enviar la solicitud. Inténtelo de nuevo.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="py-12 bg-[#fef9f0]">
    <div class="max-w-4xl mx-auto px-4 sm:px-8 space-y-10">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-[#a33d23]">
          Agendar en Línea
        </span>
        <h1 class="font-heading font-extrabold text-3xl sm:text-4xl text-[#1d1c16]">
          Solicitud de Cita y Primera Valoración
        </h1>
        <p class="text-sm sm:text-base text-[#3d4947]">
          Complete el formulario para solicitar su cita. Nuestro personal clínico coordinará el espacio idóneo para su atención.
        </p>
      </div>

      <!-- Confirmation Screen -->
      <div v-if="submittedId" class="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-[#e7e2d9] text-center space-y-6">
        <div class="w-16 h-16 rounded-full bg-[#00685d]/10 text-[#00685d] flex items-center justify-center mx-auto">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>

        <div class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-[#00685d]">
            Solicitud Registrada con Éxito
          </span>
          <h2 class="font-heading font-bold text-2xl text-[#1d1c16]">
            ¡Gracias por confiar en Centro Armonía!
          </h2>
          <p class="text-sm text-[#3d4947] max-w-lg mx-auto">
            Hemos recibido su solicitud de cita. Nuestro departamento de admisión y recepción se comunicará al número indicado para confirmar el horario exacto.
          </p>
        </div>

        <div class="bg-[#f8f3ea] p-6 rounded-2xl border border-[#ece8df] max-w-md mx-auto text-left space-y-3 text-xs sm:text-sm">
          <div class="flex justify-between border-b border-[#ece8df] pb-2">
            <span class="text-[#6d7a77]">Código de Referencia:</span>
            <span class="font-mono font-bold text-[#00685d]">{{ submittedId }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ece8df] pb-2">
            <span class="text-[#6d7a77]">Servicio Solicitado:</span>
            <span class="font-semibold text-[#1d1c16]">{{ selectedService?.nombre }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ece8df] pb-2">
            <span class="text-[#6d7a77]">Sede:</span>
            <span class="font-semibold text-[#1d1c16]">{{ form.sedePreferida }}</span>
          </div>
          <div class="flex justify-between border-b border-[#ece8df] pb-2">
            <span class="text-[#6d7a77]">Fecha sugerida:</span>
            <span class="font-semibold text-[#1d1c16]">{{ form.fechaPreferida }}</span>
          </div>
          <div class="flex justify-between pt-1">
            <span class="text-[#6d7a77]">Honorarios del Servicio:</span>
            <span class="font-extrabold text-[#a33d23]">Q {{ selectedService?.precioQ.toFixed(2) }}</span>
          </div>
        </div>

        <div class="pt-2 flex flex-wrap justify-center gap-4">
          <router-link
            to="/inicio"
            class="px-6 py-3 bg-[#00685d] hover:bg-[#008376] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            Volver al Inicio
          </router-link>
          <button
            @click="submittedId = null"
            class="px-6 py-3 bg-[#f2ede4] hover:bg-[#ece8df] text-[#1d1c16] font-semibold rounded-xl text-xs sm:text-sm border border-[#bcc9c6] transition-colors cursor-pointer"
          >
            Crear otra solicitud
          </button>
        </div>
      </div>

      <!-- Booking Form -->
      <form
        v-else
        @submit.prevent="handleSubmit"
        class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#e7e2d9] space-y-6"
      >
        <div v-if="errorMsg" class="p-3.5 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold">
          {{ errorMsg }}
        </div>

        <!-- Service Selection Card -->
        <div>
          <label class="block text-xs font-bold text-[#1d1c16] mb-2 uppercase tracking-wider">
            1. Seleccione el Servicio o Tratamiento *
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="srv in activeServices"
              :key="srv.id"
              type="button"
              @click="form.servicioId = srv.id"
              class="p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between"
              :class="form.servicioId === srv.id ? 'border-[#00685d] bg-[#00685d]/5 ring-2 ring-[#00685d]' : 'border-[#bcc9c6] bg-white hover:bg-[#f8f3ea]'"
            >
              <div>
                <div class="flex justify-between items-start gap-2">
                  <h4 class="font-heading font-bold text-sm text-[#1d1c16]">
                    {{ srv.nombre }}
                  </h4>
                  <span class="text-[11px] font-semibold text-[#00685d] bg-[#00685d]/10 px-2 py-0.5 rounded-full shrink-0">
                    {{ srv.duracionMinutos }} min
                  </span>
                </div>
                <p class="text-xs text-[#3d4947] mt-1 line-clamp-2">
                  {{ srv.descripcion }}
                </p>
              </div>
              <div class="mt-3 pt-2 border-t border-[#ece8df] flex justify-between items-center">
                <span class="text-xs text-[#6d7a77]">Costo estimado:</span>
                <span class="font-bold text-[#a33d23] text-sm">
                  Q {{ srv.precioQ.toFixed(2) }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Sede and Date -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-[#1d1c16] mb-1 uppercase tracking-wider">
              2. Sede de Preferencia *
            </label>
            <select
              v-model="form.sedePreferida"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d] bg-white"
            >
              <option value="Zona 10 - Sixtino II">Zona 10 - Edificio Sixtino II</option>
              <option value="Zona 14 - Europlaza">Zona 14 - Europlaza Las Conchas</option>
              <option value="Modalidad En Línea (Teleterapia)">Modalidad En Línea (Teleterapia)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-[#1d1c16] mb-1 uppercase tracking-wider">
              3. Fecha Preferida *
            </label>
            <input
              type="date"
              required
              :min="new Date().toISOString().slice(0, 10)"
              v-model="form.fechaPreferida"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d] bg-white"
            />
          </div>
        </div>

        <!-- Requester Contact Info -->
        <div class="pt-2 space-y-4">
          <label class="block text-xs font-bold text-[#1d1c16] uppercase tracking-wider">
            4. Datos de Contacto del Solicitante *
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-[#3d4947] mb-1 font-semibold">Nombre y Apellido *</label>
              <input
                type="text"
                required
                placeholder="Ej. Patricia Aldana"
                v-model="form.solicitanteNombre"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
              />
            </div>

            <div>
              <label class="block text-xs text-[#3d4947] mb-1 font-semibold">Correo Electrónico *</label>
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                v-model="form.email"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
              />
            </div>

            <div>
              <label class="block text-xs text-[#3d4947] mb-1 font-semibold">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+502 5555-1234"
                v-model="form.telefono"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-[#3d4947] mb-1 font-semibold">
              Motivo de Consulta o Información Relevante (Edad del paciente, diagnóstico previo, etc.)
            </label>
            <textarea
              rows="3"
              placeholder="Ej. Niño de 3 años, derivado por pediatra para evaluación del lenguaje y sospecha de pérdida auditiva..."
              v-model="form.mensaje"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] text-sm focus:outline-none focus:ring-2 focus:ring-[#00685d]"
            />
          </div>
        </div>

        <!-- Submit Action -->
        <div class="pt-4 border-t border-[#ece8df] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-[#6d7a77]">
            <p>• Las solicitudes son procesadas de lunes a sábado en horario hábil.</p>
            <p>• El envío de este formulario no debita cobro automático.</p>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full sm:w-auto px-8 py-3.5 bg-[#a33d23] hover:bg-[#83260e] text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span class="material-symbols-outlined text-lg">{{ isSubmitting ? 'progress_activity' : 'send' }}</span>
            <span>{{ isSubmitting ? 'Enviando…' : 'Confirmar y Enviar Solicitud' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
