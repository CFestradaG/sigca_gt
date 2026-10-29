<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { EducationalMaterial } from '../../types';

const store = useAppStore();
const canManageMaterials = computed(() => store.currentUser?.role === 'ADMIN');
const canAssignMaterials = computed(() => ['ADMIN', 'PROFESIONAL'].includes(store.currentUser?.role || ''));

const typeFilter = ref<string>('TODOS');
const showAddModal = ref(false);
const editingMaterial = ref<EducationalMaterial | null>(null);
const managingAssignmentsMaterial = ref<EducationalMaterial | null>(null);
const isSaving = ref(false);
const errorMessage = ref('');

const form = ref({
  titulo: '',
  descripcion: '',
  tipo: 'GUIA' as EducationalMaterial['tipo'],
  enlaceRecurso: '',
  estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
});

const handleOpenAdd = () => {
  errorMessage.value = '';
  editingMaterial.value = null;
  form.value = {
    titulo: '',
    descripcion: '',
    tipo: 'GUIA',
    enlaceRecurso: '',
    estado: 'ACTIVO',
  };
  showAddModal.value = true;
};

const handleOpenEdit = (m: EducationalMaterial) => {
  errorMessage.value = '';
  editingMaterial.value = m;
  form.value = {
    titulo: m.titulo,
    descripcion: m.descripcion,
    tipo: m.tipo,
    enlaceRecurso: m.enlaceRecurso,
    estado: m.estado,
  };
  showAddModal.value = true;
};

const handleSubmit = async () => {
  errorMessage.value = '';
  isSaving.value = true;
  try {
    const data = {
      titulo: form.value.titulo.trim(),
      descripcion: form.value.descripcion.trim(),
      tipo: form.value.tipo,
      enlaceRecurso: form.value.enlaceRecurso.trim(),
      estado: form.value.estado,
    };
    if (editingMaterial.value) {
      await store.updateMaterial(editingMaterial.value.id, data);
    } else {
      await store.addMaterial({ ...data, assignedPatientIds: [] });
    }
    showAddModal.value = false;
  } catch (error: any) {
    errorMessage.value = error?.message || 'No se pudo guardar el material.';
  } finally {
    isSaving.value = false;
  }
};

const toggleStatus = async (m: EducationalMaterial) => {
  errorMessage.value = '';
  try {
    await store.updateMaterial(m.id, { estado: m.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' });
  } catch (error: any) {
    errorMessage.value = error?.message || 'No se pudo cambiar el estado del material.';
  }
};

const setPatientAssignment = async (materialId: string, patientId: string, assign: boolean) => {
  errorMessage.value = '';
  try {
    if (assign) await store.assignMaterialToPatient(materialId, patientId);
    else await store.removeMaterialFromPatient(materialId, patientId);
    managingAssignmentsMaterial.value = store.materials.find((m) => m.id === materialId) || null;
  } catch (error: any) {
    errorMessage.value = error?.message || 'No se pudo actualizar la asignación.';
  }
};

const filteredMaterials = computed(() => {
  return store.materials.filter((m) =>
    typeFilter.value === 'TODOS' ? true : m.tipo === typeFilter.value
  );
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="errorMessage" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">{{ errorMessage }}</div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Gestión de Materiales Educativos y Fonoaudiológicos
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Recursos didácticos, audios de discriminación, fichas y asignación individual a pacientes.
        </p>
      </div>

      <button
        v-if="canManageMaterials"
        @click="handleOpenAdd"
        class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
      >
        <span class="material-symbols-outlined text-base">add_circle</span>
        <span>Nuevo Material</span>
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in (['TODOS', 'GUIA', 'FICHA', 'AUDIO', 'EJERCICIO', 'VIDEO'] as const)"
        :key="t"
        @click="typeFilter = t"
        class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        :class="typeFilter === t ? 'bg-[#00685d] text-white shadow-xs' : 'bg-white text-[#3d4947] hover:bg-[#ece8df] border border-[#e7e2d9]'"
      >
        {{ t }}
      </button>
    </div>

    <!-- Materials Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="mat in filteredMaterials"
        :key="mat.id"
        class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs p-6 flex flex-col justify-between space-y-4"
      >
        <div>
          <div class="flex justify-between items-start">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#a33d23] px-2.5 py-0.5 rounded-full bg-[#ffdad2]">
              {{ mat.tipo }}
            </span>
            <button
              v-if="canManageMaterials"
              @click="toggleStatus(mat)"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer"
              :class="mat.estado === 'ACTIVO' ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ffdad6] text-[#ba1a1a]'"
            >
              {{ mat.estado }}
            </button>
          </div>

          <h3 class="font-heading font-bold text-base text-[#1d1c16] mt-3">
            {{ mat.titulo }}
          </h3>
          <p class="text-xs text-[#3d4947] mt-1.5 leading-relaxed">
            {{ mat.descripcion }}
          </p>

          <!-- Assigned Patients Badge List -->
          <div class="mt-4 pt-3 border-t border-[#ece8df]">
            <div class="flex justify-between items-center mb-1.5">
              <span class="text-[10px] font-bold text-[#6d7a77] uppercase">
                Asignado a ({{ store.patients.filter((p) => mat.assignedPatientIds.includes(p.id)).length }}):
              </span>
              <button
                v-if="canAssignMaterials"
                @click="managingAssignmentsMaterial = mat"
                class="text-[11px] font-bold text-[#00685d] hover:underline cursor-pointer"
              >
                Gestionar
              </button>
            </div>

            <div v-if="store.patients.filter((p) => mat.assignedPatientIds.includes(p.id)).length === 0" class="text-[11px] text-[#6d7a77] italic">
              Sin pacientes asignados
            </div>
            <div v-else class="flex flex-wrap gap-1">
              <span
                v-for="p in store.patients.filter((p) => mat.assignedPatientIds.includes(p.id))"
                :key="p.id"
                class="text-[10px] font-semibold text-[#00685d] bg-[#f8f3ea] border border-[#bcc9c6] px-2 py-0.5 rounded-full"
              >
                {{ p.nombres }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-[#ece8df] flex justify-between items-center text-xs">
          <a
            v-if="mat.enlaceRecurso"
            :href="mat.enlaceRecurso"
            target="_blank"
            rel="noreferrer"
            class="font-bold text-[#00685d] hover:underline flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-sm">open_in_new</span>
            <span>Recurso</span>
          </a>
          <span v-else class="text-[#6d7a77] text-[11px]">Enlace no provisto</span>

          <button
            v-if="canManageMaterials"
            @click="handleOpenEdit(mat)"
            class="px-2.5 py-1 bg-[#f8f3ea] hover:bg-[#ece8df] text-[#00685d] rounded-lg font-bold border border-[#bcc9c6] cursor-pointer"
          >
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Material Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          {{ editingMaterial ? 'Editar Material' : 'Nuevo Material' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Título del Recurso *</label>
            <input
              type="text"
              required
              v-model="form.titulo"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Tipo *</label>
              <select
                v-model="form.tipo"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
              >
                <option value="GUIA">GUIA</option>
                <option value="FICHA">FICHA</option>
                <option value="AUDIO">AUDIO</option>
                <option value="EJERCICIO">EJERCICIO</option>
                <option value="VIDEO">VIDEO</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Estado *</label>
              <select
                v-model="form.estado"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Enlace al Recurso (URL / PDF / Audio)</label>
            <input
              type="url"
              required
              placeholder="https://..."
              v-model="form.enlaceRecurso"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Descripción y Objetivos Terapéuticos</label>
            <textarea
              rows="3"
              v-model="form.descripcion"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Guardar Material
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Assignments Submodal -->
    <div v-if="managingAssignmentsMaterial" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#bcc9c6]">
        <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
          Asignar Pacientes a "{{ managingAssignmentsMaterial.titulo }}"
        </h3>
        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
            v-for="p in store.patients"
            :key="p.id"
            class="p-3 bg-[#f8f3ea] rounded-xl border border-[#ece8df] flex justify-between items-center text-xs"
          >
            <div>
              <span class="font-bold text-[#1d1c16] block">{{ p.nombres }} {{ p.apellidos }}</span>
              <span class="text-[11px] text-[#6d7a77]">{{ p.id }}</span>
            </div>
            <button
              v-if="managingAssignmentsMaterial.assignedPatientIds.includes(p.id)"
              @click="setPatientAssignment(managingAssignmentsMaterial.id, p.id, false)"
              class="px-2.5 py-1 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-xs font-bold cursor-pointer"
            >
              Quitar
            </button>
            <button
              v-else
              @click="setPatientAssignment(managingAssignmentsMaterial.id, p.id, true)"
              class="px-2.5 py-1 bg-[#00685d] text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Asignar
            </button>
          </div>
        </div>
        <div class="text-right pt-2 border-t border-[#ece8df]">
          <button
            @click="managingAssignmentsMaterial = null"
            class="px-4 py-2 bg-[#1d1c16] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
