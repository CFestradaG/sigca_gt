<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { Patient } from '../../types';
import PatientDetailModal from '../../components/admin/PatientDetailModal.vue';
import ImageUploadField from '../../components/shared/ImageUploadField.vue';

const store = useAppStore();

const searchTerm = ref('');
const statusFilter = ref<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
const showAddModal = ref(false);
const editingPatient = ref<Patient | null>(null);
const isSaving = ref(false);
const formError = ref('');
const canManagePatients = computed(() => store.currentUser?.role === 'ADMIN' || store.currentUser?.role === 'RECEPCION');

const formData = ref({
  nombres: '',
  apellidos: '',
  fechaNacimiento: '2019-01-01',
  sexo: 'M' as 'M' | 'F' | 'Otro',
  telefono: '',
  direccion: '',
  fechaInicio: new Date().toISOString().slice(0, 10),
  observaciones: '',
  photoUrl: '',
});

const handleOpenAdd = () => {
  formData.value = {
    nombres: '',
    apellidos: '',
    fechaNacimiento: '2019-01-01',
    sexo: 'M',
    telefono: '',
    direccion: '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    observaciones: '',
    photoUrl: '',
  };
  editingPatient.value = null;
  showAddModal.value = true;
};

const handleOpenEdit = (p: Patient) => {
  formData.value = {
    nombres: p.nombres,
    apellidos: p.apellidos,
    fechaNacimiento: p.fechaNacimiento,
    sexo: p.sexo,
    telefono: p.telefono,
    direccion: p.direccion,
    fechaInicio: p.fechaInicio,
    observaciones: p.observaciones,
    photoUrl: p.photoUrl,
  };
  editingPatient.value = p;
  showAddModal.value = true;
};

const handleSubmit = async () => {
  if (!formData.value.nombres.trim() || !formData.value.apellidos.trim()) return;
  formError.value = '';
  isSaving.value = true;
  try {
    if (editingPatient.value) {
      await store.updatePatient(editingPatient.value.id, {
      nombres: formData.value.nombres.trim(),
      apellidos: formData.value.apellidos.trim(),
      fechaNacimiento: formData.value.fechaNacimiento,
      sexo: formData.value.sexo,
      telefono: formData.value.telefono.trim(),
      direccion: formData.value.direccion.trim(),
      fechaInicio: formData.value.fechaInicio,
      observaciones: formData.value.observaciones.trim(),
      photoUrl: formData.value.photoUrl,
      });
    } else {
      const created = await store.addPatient({
      nombres: formData.value.nombres.trim(),
      apellidos: formData.value.apellidos.trim(),
      fechaNacimiento: formData.value.fechaNacimiento,
      sexo: formData.value.sexo,
      telefono: formData.value.telefono.trim(),
      direccion: formData.value.direccion.trim(),
      fechaInicio: formData.value.fechaInicio,
      observaciones: formData.value.observaciones.trim(),
      photoUrl: formData.value.photoUrl,
      estado: 'ACTIVO',
      });
      store.setSelectedPatientId(created.id);
    }
    showAddModal.value = false;
  } catch (err: any) {
    formError.value = err?.message || 'No se pudieron guardar los datos del paciente.';
  } finally {
    isSaving.value = false;
  }
};

const filteredPatients = computed(() => {
  return store.patients
    .filter((p) => (statusFilter.value === 'TODOS' ? true : p.estado === statusFilter.value))
    .filter((p) => {
      const query = (searchTerm.value || store.globalSearchTerm).toLowerCase();
      return (
        p.nombres.toLowerCase().includes(query) ||
        p.apellidos.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.telefono.toLowerCase().includes(query)
      );
    });
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">
          Gestión de Pacientes Clínicos
        </h2>
        <p class="text-xs text-[#6d7a77]">
          Registro, expedientes, historial de citas y control de tutores legales.
        </p>
      </div>

      <button
        v-if="canManagePatients"
        @click="handleOpenAdd"
        class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
      >
        <span class="material-symbols-outlined text-base">person_add</span>
        <span>Registrar Nuevo Paciente</span>
      </button>
    </div>

    <!-- Filter and search bar -->
    <div class="bg-white p-4 rounded-2xl border border-[#e7e2d9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-80">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6d7a77]">
          search
        </span>
        <input
          type="search"
          placeholder="Buscar por nombre, apellido, ID..."
          v-model="searchTerm"
          class="w-full h-10 pl-9 pr-3 rounded-xl bg-[#f8f3ea] border border-[#bcc9c6] text-xs text-[#1d1c16] focus:outline-none focus:ring-2 focus:ring-[#00685d]"
        />
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
        <button
          v-for="filter in (['TODOS', 'ACTIVO', 'INACTIVO'] as const)"
          :key="filter"
          @click="statusFilter = filter"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="statusFilter === filter ? 'bg-[#00685d] text-white' : 'bg-[#f2ede4] text-[#3d4947] hover:bg-[#ece8df]'"
        >
          {{ filter === 'TODOS' ? 'Todos' : filter === 'ACTIVO' ? 'Activos' : 'Inactivos (Baja Lógica)' }}
        </button>
      </div>
    </div>

    <!-- Patients Table -->
    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#f8f3ea] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
            <tr>
              <th class="py-3 px-4">Paciente / Expediente</th>
              <th class="py-3 px-4">Edad Calculada</th>
              <th class="py-3 px-4">Responsables / Tutores</th>
              <th class="py-3 px-4">Teléfono & Dirección</th>
              <th class="py-3 px-4">Estado</th>
              <th class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#ece8df]">
            <tr v-if="filteredPatients.length === 0">
              <td colspan="6" class="py-8 text-center text-[#6d7a77]">
                No se encontraron pacientes con los criterios de búsqueda.
              </td>
            </tr>
            <tr
              v-for="patient in filteredPatients"
              :key="patient.id"
              class="hover:bg-[#fef9f0] transition-colors"
            >
              <!-- Name & Photo -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="patient.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=256&q=80'"
                    :alt="patient.nombres"
                    class="w-10 h-10 rounded-xl object-cover ring-1 ring-[#bcc9c6]"
                  />
                  <div>
                    <button
                      @click="store.setSelectedPatientId(patient.id)"
                      class="font-heading font-bold text-sm text-[#1d1c16] hover:text-[#00685d] text-left cursor-pointer"
                    >
                      {{ patient.nombres }} {{ patient.apellidos }}
                    </button>
                    <span class="block text-[11px] font-mono text-[#6d7a77]">
                      {{ patient.id }} • Sexo: {{ patient.sexo }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Age -->
              <td class="py-3.5 px-4">
                <span class="font-bold text-[#1d1c16] block">{{ store.calculateAge(patient.fechaNacimiento).text }}</span>
                <span class="text-[11px] text-[#6d7a77]">
                  Nac: {{ patient.fechaNacimiento }}
                </span>
              </td>

              <!-- Guardians -->
              <td class="py-3.5 px-4">
                <div v-if="store.getPatientGuardians(patient.id).length > 0" class="space-y-0.5">
                  <span
                    v-for="g in store.getPatientGuardians(patient.id)"
                    :key="g.id"
                    class="inline-block text-[11px] font-semibold text-[#00685d] bg-[#00685d]/10 px-2 py-0.5 rounded-full mr-1"
                  >
                    {{ g.nombres }} ({{ g.parentesco }})
                  </span>
                </div>
                <span
                  v-else
                  class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  :class="store.isMinor(patient.fechaNacimiento) ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#f2ede4] text-[#6d7a77]'"
                >
                  <span class="material-symbols-outlined text-xs">
                    {{ store.isMinor(patient.fechaNacimiento) ? 'error' : 'info' }}
                  </span>
                  <span>{{ store.isMinor(patient.fechaNacimiento) ? 'Requiere tutor' : 'Sin tutor' }}</span>
                </span>
              </td>

              <!-- Contact & Address -->
              <td class="py-3.5 px-4 text-[#3d4947]">
                <p class="font-semibold text-[#1d1c16]">{{ patient.telefono }}</p>
                <p class="text-[11px] text-[#6d7a77] line-clamp-1">{{ patient.direccion }}</p>
              </td>

              <!-- State -->
              <td class="py-3.5 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="patient.estado === 'ACTIVO' ? 'bg-[#00685d]/10 text-[#00685d]' : 'bg-[#ffdad6] text-[#ba1a1a]'"
                >
                  {{ patient.estado }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                <button
                  @click="store.setSelectedPatientId(patient.id)"
                  title="Abrir Ficha de Paciente completa"
                  class="px-2.5 py-1.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Ficha
                </button>

                <button
                  v-if="canManagePatients"
                  @click="handleOpenEdit(patient)"
                  title="Editar información"
                  class="p-1.5 text-[#3d4947] hover:bg-[#ece8df] rounded-lg cursor-pointer"
                >
                  <span class="material-symbols-outlined text-base">edit</span>
                </button>

                <button
                  v-if="canManagePatients"
                  @click="store.togglePatientStatus(patient.id)"
                  :title="patient.estado === 'ACTIVO' ? 'Desactivar paciente (Baja lógica)' : 'Reactivar paciente'"
                  class="p-1.5 rounded-lg cursor-pointer"
                  :class="patient.estado === 'ACTIVO' ? 'text-[#ba1a1a] hover:bg-[#ffdad6]' : 'text-[#00685d] hover:bg-[#8cf5e4]'"
                >
                  <span class="material-symbols-outlined text-base">
                    {{ patient.estado === 'ACTIVO' ? 'toggle_on' : 'toggle_off' }}
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Patient Detail Modal -->
    <PatientDetailModal
      v-if="store.selectedPatientId"
      :patient-id="store.selectedPatientId"
      @close="store.setSelectedPatientId(null)"
      @edit-patient="handleOpenEdit"
    />

    <!-- Add / Edit Patient Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#bcc9c6] max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b border-[#ece8df] pb-3">
          <h3 class="font-heading font-bold text-lg text-[#1d1c16]">
            {{ editingPatient ? 'Editar Datos del Paciente' : 'Registrar Nuevo Paciente' }}
          </h3>
          <button @click="showAddModal = false" class="text-[#6d7a77] hover:text-[#1d1c16]">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div v-if="formError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04]">{{ formError }}</div>
          <ImageUploadField v-model="formData.photoUrl" label="Fotografía del paciente" :alt="formData.nombres || 'Paciente'" />
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Nombres *</label>
              <input
                type="text"
                required
                placeholder="Ej. Mateo Alejandro"
                v-model="formData.nombres"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Apellidos *</label>
              <input
                type="text"
                required
                placeholder="Ej. Méndez Gómez"
                v-model="formData.apellidos"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Fecha de Nacimiento *</label>
              <input
                type="date"
                required
                v-model="formData.fechaNacimiento"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Sexo *</label>
              <select
                v-model="formData.sexo"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs bg-white focus:ring-1 focus:ring-[#00685d]"
              >
                <option value="M">Masculino (M)</option>
                <option value="F">Femenino (F)</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Teléfono</label>
              <input
                type="tel"
                placeholder="+502 2333-8899"
                v-model="formData.telefono"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
              />
            </div>
            <div>
              <label class="block font-bold text-[#1d1c16] mb-1">Fecha Inicio Proceso</label>
              <input
                type="date"
                v-model="formData.fechaInicio"
                class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">Dirección Domiciliar</label>
            <input
              type="text"
              placeholder="Ej. Zona 14, Ciudad de Guatemala"
              v-model="formData.direccion"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
            />
          </div>

          <div>
            <label class="block font-bold text-[#1d1c16] mb-1">
              Observaciones Administrativas / Diagnóstico Inicial
            </label>
            <textarea
              rows="3"
              placeholder="Detalles clínicos o administrativos relevantes..."
              v-model="formData.observaciones"
              class="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs focus:ring-1 focus:ring-[#00685d]"
            />
          </div>

          <div class="pt-3 border-t border-[#ece8df] flex justify-end gap-3">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 bg-[#f2ede4] hover:bg-[#ece8df] text-[#1d1c16] rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-5 py-2 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              {{ isSaving ? 'Guardando…' : editingPatient ? 'Guardar Cambios' : 'Registrar Paciente' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
