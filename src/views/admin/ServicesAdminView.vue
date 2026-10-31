<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { ClinicalService } from '../../types';

const store = useAppStore();

const showModal = ref(false);
const editingService = ref<ClinicalService | null>(null);
const errorMessage = ref('');
const canManageServices = computed(() => store.currentUser?.role === 'ADMIN');

const form = ref({
  nombre: '',
  descripcion: '',
  duracionMinutos: 45,
  precioQ: 350,
  imagenUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  categoria: 'Estimulación Auditiva' as any,
});

const handleOpenAdd = () => {
  editingService.value = null;
  form.value = {
    nombre: '',
    descripcion: '',
    duracionMinutos: 45,
    precioQ: 350,
    imagenUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    estado: 'ACTIVO',
    categoria: 'Estimulación Auditiva',
  };
  showModal.value = true;
};

const handleOpenEdit = (s: ClinicalService) => {
  editingService.value = s;
  form.value = {
    nombre: s.nombre,
    descripcion: s.descripcion,
    duracionMinutos: s.duracionMinutos,
    precioQ: s.precioQ,
    imagenUrl: s.imagenUrl,
    estado: s.estado,
    categoria: s.categoria,
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!canManageServices.value) return;
  if (!form.value.nombre.trim()) return;

  errorMessage.value = '';
  try {
    if (editingService.value) {
      await store.updateService(editingService.value.id, {
        nombre: form.value.nombre.trim(),
        descripcion: form.value.descripcion.trim(),
        duracionMinutos: Number(form.value.duracionMinutos),
        precioQ: Number(form.value.precioQ),
        imagenUrl: form.value.imagenUrl,
        estado: form.value.estado,
        categoria: form.value.categoria,
      });
    } else {
      await store.addService({
        nombre: form.value.nombre.trim(),
        descripcion: form.value.descripcion.trim(),
        duracionMinutos: Number(form.value.duracionMinutos),
        precioQ: Number(form.value.precioQ),
        imagenUrl: form.value.imagenUrl,
        estado: form.value.estado,
        categoria: form.value.categoria,
      });
    }
    showModal.value = false;
  } catch (err: any) {
    errorMessage.value = err?.message || 'No se pudo guardar el servicio.';
  }
};

const toggleStatus = async (s: ClinicalService) => {
  if (!canManageServices.value) return;
  errorMessage.value = '';
  try {
    await store.updateService(s.id, {
      estado: s.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
    });
  } catch (err: any) {
    errorMessage.value = err?.message || 'No se pudo cambiar el estado del servicio.';
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Administración de Servicios y Tarifas
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Configuración de catálogo, honorarios en Quetzales y sincronización con el portal público.
        </p>
      </div>

      <button
        v-if="canManageServices"
        @click="handleOpenAdd"
        class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
      >
        <span class="material-symbols-outlined text-base">add_circle</span>
        <span>Nuevo Servicio</span>
      </button>
    </div>

    <div v-if="errorMessage" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs font-semibold">
      {{ errorMessage }}
    </div>

    <!-- Services Table -->
    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#f8f3ea] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
            <tr>
              <th class="py-3 px-4">Servicio Clínico</th>
              <th class="py-3 px-4">Categoría</th>
              <th class="py-3 px-4">Duración</th>
              <th class="py-3 px-4">Honorarios (Q)</th>
              <th class="py-3 px-4">Estado</th>
              <th class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#ece8df]">
            <tr v-for="srv in store.services" :key="srv.id" class="hover:bg-[#fef9f0] transition-colors">
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="srv.imagenUrl"
                    :alt="srv.nombre"
                    class="w-12 h-12 rounded-xl object-cover ring-1 ring-[#bcc9c6]"
                  />
                  <div>
                    <h4 class="font-heading font-bold text-sm text-[#1d1c16]">
                      {{ srv.nombre }}
                    </h4>
                    <p class="text-[11px] text-[#6d7a77] line-clamp-1 max-w-md">
                      {{ srv.descripcion }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-4">
                <span class="text-[11px] font-semibold text-[#00685d] bg-[#00685d]/10 px-2.5 py-0.5 rounded-full">
                  {{ srv.categoria }}
                </span>
              </td>

              <td class="py-3.5 px-4 font-bold text-[#3d4947]">
                {{ srv.duracionMinutos }} minutos
              </td>

              <td class="py-3.5 px-4 font-extrabold text-sm text-[#00685d]">
                Q {{ srv.precioQ.toFixed(2) }}
              </td>

              <td class="py-3.5 px-4">
                <button
                  v-if="canManageServices"
                  @click="toggleStatus(srv)"
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors"
                  :class="srv.estado === 'ACTIVO' ? 'bg-[#00685d]/10 text-[#00685d] hover:bg-[#ffdad6] hover:text-[#ba1a1a]' : 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#8cf5e4] hover:text-[#005048]'"
                  title="Haga clic para cambiar estado"
                >
                  {{ srv.estado }}
                </button>
                <span v-else class="px-2.5 py-0.5 rounded-full text-[10px] font-bold" :class="srv.estado === 'ACTIVO' ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ffdad6] text-[#ba1a1a]'">
                  {{ srv.estado }}
                </span>
              </td>

              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <button
                  v-if="canManageServices"
                  @click="handleOpenEdit(srv)"
                  class="px-2.5 py-1.5 bg-[#f8f3ea] hover:bg-[#ece8df] border border-[#bcc9c6] text-[#00685d] rounded-lg text-xs font-bold flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <span class="material-symbols-outlined text-sm">edit</span>
                  <span>Editar</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6] max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-[#ece8df] pb-3">
          <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
            {{ editingService ? 'Editar Servicio' : 'Nuevo Servicio' }}
          </h3>
          <button @click="showModal = false" class="text-[#6d7a77]">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Nombre del Servicio *</label>
            <input
              type="text"
              required
              v-model="form.nombre"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Categoría *</label>
              <select
                v-model="form.categoria"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
              >
                <option value="Estimulación Auditiva">Estimulación Auditiva</option>
                <option value="Psicología">Psicología</option>
                <option value="Lenguaje">Lenguaje</option>
                <option value="Evaluación Integral">Evaluación Integral</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Duración (minutos) *</label>
              <input
                type="number"
                required
                min="15"
                step="5"
                v-model="form.duracionMinutos"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Precio en Quetzales (Q) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                v-model="form.precioQ"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs font-bold text-[#00685d]"
              />
            </div>

            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Estado *</label>
              <select
                v-model="form.estado"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
              >
                <option value="ACTIVO">ACTIVO (Visible en portal)</option>
                <option value="INACTIVO">INACTIVO (Oculto)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">URL de Imagen Ilustrativa</label>
            <input
              type="url"
              v-model="form.imagenUrl"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Descripción Clínica</label>
            <textarea
              rows="3"
              v-model="form.descripcion"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Guardar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
