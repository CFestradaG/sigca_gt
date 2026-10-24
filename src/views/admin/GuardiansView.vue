<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/appStore';
import { Guardian } from '../../types';
import ImageUploadField from '../../components/shared/ImageUploadField.vue';

const store = useAppStore();
const router = useRouter();

const searchTerm = ref('');
const showModal = ref(false);
const editingGuardian = ref<Guardian | null>(null);
const isSaving = ref(false);
const formError = ref('');

const form = ref({
  nombres: '',
  apellidos: '',
  parentesco: 'Madre',
  telefono: '',
  email: '',
  direccion: '',
  photoUrl: '',
  selectedPatientIds: [] as string[],
});

const handleOpenAdd = () => {
  editingGuardian.value = null;
  form.value = {
    nombres: '',
    apellidos: '',
    parentesco: 'Madre',
    telefono: '',
    email: '',
    direccion: '',
    photoUrl: '',
    selectedPatientIds: [],
  };
  showModal.value = true;
};

const handleOpenEdit = (g: Guardian) => {
  editingGuardian.value = g;
  form.value = {
    nombres: g.nombres,
    apellidos: g.apellidos,
    parentesco: g.parentesco,
    telefono: g.telefono,
    email: g.email,
    direccion: g.direccion,
    photoUrl: g.photoUrl,
    selectedPatientIds: [...g.patientIds],
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!form.value.nombres.trim() || !form.value.telefono.trim()) return;
  formError.value = '';
  isSaving.value = true;
  try {
    if (editingGuardian.value) {
      await store.updateGuardian(editingGuardian.value.id, {
      nombres: form.value.nombres.trim(),
      apellidos: form.value.apellidos.trim(),
      parentesco: form.value.parentesco,
      telefono: form.value.telefono.trim(),
      email: form.value.email.trim(),
      direccion: form.value.direccion.trim(),
      photoUrl: form.value.photoUrl,
      patientIds: form.value.selectedPatientIds,
      });
    } else {
      await store.addGuardian({
      nombres: form.value.nombres.trim(),
      apellidos: form.value.apellidos.trim(),
      parentesco: form.value.parentesco,
      telefono: form.value.telefono.trim(),
      email: form.value.email.trim(),
      direccion: form.value.direccion.trim(),
      photoUrl: form.value.photoUrl,
      patientIds: form.value.selectedPatientIds,
      });
    }
    showModal.value = false;
  } catch (err: any) {
    formError.value = err?.message || 'No se pudieron guardar los datos del responsable.';
  } finally {
    isSaving.value = false;
  }
};

const togglePatientSelection = (pId: string) => {
  if (form.value.selectedPatientIds.includes(pId)) {
    form.value.selectedPatientIds = form.value.selectedPatientIds.filter((id) => id !== pId);
  } else {
    form.value.selectedPatientIds.push(pId);
  }
};

const filteredGuardians = computed(() => {
  const q = searchTerm.value.toLowerCase();
  return store.guardians.filter((g) => {
    return (
      g.nombres.toLowerCase().includes(q) ||
      g.apellidos.toLowerCase().includes(q) ||
      g.telefono.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q)
    );
  });
});

const goToPatient = (patientId: string) => {
  store.setSelectedPatientId(patientId);
  router.push('/admin/pacientes');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Gestión de Padres y Responsables
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Registro de tutores legales, parentescos y vinculación a pacientes (RF-04).
        </p>
      </div>

      <button
        @click="handleOpenAdd"
        class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
      >
        <span class="material-symbols-outlined text-base">person_add</span>
        <span>Registrar Responsable</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-[#e7e2d9] shadow-xs flex items-center justify-between gap-4">
      <div class="relative w-full max-w-sm">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6d7a77]">
          search
        </span>
        <input
          type="search"
          placeholder="Buscar tutor por nombre, teléfono o correo..."
          v-model="searchTerm"
          class="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8f3ea] border border-[#bcc9c6] text-xs text-[#1d1c16] focus:outline-none focus:ring-2 focus:ring-[#00685d]"
        />
      </div>
    </div>

    <!-- Guardians Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="filteredGuardians.length === 0" class="col-span-3 p-12 text-center bg-white rounded-2xl border border-[#e7e2d9] text-xs text-[#6d7a77]">
        No se encontraron responsables registrados.
      </div>
      <div
        v-else
        v-for="g in filteredGuardians"
        :key="g.id"
        class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs p-6 flex flex-col justify-between space-y-4"
      >
        <div>
          <div class="flex items-center gap-3">
            <img
              :src="g.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'"
              :alt="g.nombres"
              class="w-12 h-12 rounded-xl object-cover ring-1 ring-[#bcc9c6]"
            />
            <div>
              <h4 class="font-heading font-bold text-base text-[#1d1c16]">
                {{ g.nombres }} {{ g.apellidos }}
              </h4>
              <span class="text-[11px] font-bold text-[#a33d23] bg-[#ffdad2] px-2 py-0.5 rounded-full">
                {{ g.parentesco }}
              </span>
            </div>
          </div>

          <div class="pt-4 space-y-1.5 text-xs text-[#3d4947] border-t border-[#ece8df] mt-4">
            <p class="flex items-center gap-2">
              <span class="material-symbols-outlined text-sm text-[#00685d]">call</span>
              <strong class="text-[#1d1c16]">{{ g.telefono }}</strong>
            </p>
            <p class="flex items-center gap-2">
              <span class="material-symbols-outlined text-sm text-[#00685d]">mail</span>
              <span>{{ g.email }}</span>
            </p>
            <p class="flex items-center gap-2 text-[11px] text-[#6d7a77]">
              <span class="material-symbols-outlined text-sm">location_on</span>
              <span class="line-clamp-1">{{ g.direccion }}</span>
            </p>
          </div>

          <!-- Linked Patients List -->
          <div class="pt-3 border-t border-[#ece8df] mt-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#6d7a77] block mb-1">
              Pacientes Vinculados ({{ store.patients.filter((p) => g.patientIds.includes(p.id)).length }})
            </span>
            <div v-if="store.patients.filter((p) => g.patientIds.includes(p.id)).length === 0" class="text-[11px] text-[#ba1a1a] italic">
              Sin pacientes asociados
            </div>
            <div v-else class="flex flex-wrap gap-1">
              <button
                v-for="p in store.patients.filter((p) => g.patientIds.includes(p.id))"
                :key="p.id"
                @click="goToPatient(p.id)"
                class="text-[11px] font-semibold text-[#00685d] bg-[#00685d]/10 hover:bg-[#00685d]/20 px-2 py-0.5 rounded-full cursor-pointer"
              >
                {{ p.nombres }} {{ p.apellidos }} &gt;
              </button>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-[#ece8df] flex justify-end">
          <button
            @click="handleOpenEdit(g)"
            class="px-3 py-1.5 bg-[#f8f3ea] hover:bg-[#ece8df] text-[#00685d] rounded-xl text-xs font-bold border border-[#bcc9c6] flex items-center gap-1 cursor-pointer"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
            <span>Modificar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Guardian Modal -->
    <div v-if="showModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6] max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-[#ece8df] pb-3">
          <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
            {{ editingGuardian ? 'Modificar Responsable' : 'Registrar Nuevo Responsable' }}
          </h3>
          <button @click="showModal = false" class="text-[#6d7a77]">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div v-if="formError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04]">{{ formError }}</div>
          <ImageUploadField v-model="form.photoUrl" label="Fotografía del responsable" :alt="form.nombres || 'Responsable'" />
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Nombres *</label>
              <input
                type="text"
                required
                placeholder="Ej. Carlos Roberto"
                v-model="form.nombres"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Apellidos *</label>
              <input
                type="text"
                required
                placeholder="Ej. Méndez Arriola"
                v-model="form.apellidos"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Parentesco *</label>
              <select
                v-model="form.parentesco"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white"
              >
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Tutor Legal">Tutor Legal</option>
                <option value="Abuela">Abuela</option>
                <option value="Abuelo">Abuelo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Teléfono *</label>
              <input
                type="tel"
                required
                placeholder="+502 5555-1234"
                v-model="form.telefono"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              v-model="form.email"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Dirección Domiciliar</label>
            <input
              type="text"
              placeholder="Ej. Zona 14, Ciudad de Guatemala"
              v-model="form.direccion"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">
              Asociar a Paciente(s) *
            </label>
            <div class="max-h-36 overflow-y-auto p-2 bg-[#f8f3ea] rounded-xl border border-[#ece8df] space-y-1.5">
              <label
                v-for="p in store.patients"
                :key="p.id"
                class="flex items-center gap-2 text-xs text-[#1d1c16] hover:bg-white p-1 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="form.selectedPatientIds.includes(p.id)"
                  @change="togglePatientSelection(p.id)"
                  class="rounded text-[#00685d] focus:ring-0"
                />
                <span>
                  {{ p.nombres }} {{ p.apellidos }} ({{ p.id }})
                </span>
              </label>
            </div>
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-2">
            <button type="button" @click="showModal = false" class="px-4 py-2 bg-[#f2ede4] rounded-xl text-xs font-bold">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-5 py-2 bg-[#00685d] text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-60">
              {{ isSaving ? 'Guardando…' : 'Guardar Responsable' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>
