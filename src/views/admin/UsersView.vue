<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '../../stores/appStore';
import type { User, UserRole } from '../../types';
import ImageUploadField from '../../components/shared/ImageUploadField.vue';

const store = useAppStore();
const searchTerm = ref('');
const showForm = ref(false);
const editingUser = ref<User | null>(null);
const isSaving = ref(false);
const formError = ref('');
const pageError = ref('');

const emptyForm = () => ({
  name: '', email: '', password: '', role: 'PROFESIONAL' as UserRole,
  specialty: '', phone: '', active: true,
  avatarUrl: '',
});
const form = ref(emptyForm());

const filteredUsers = computed(() => {
  const q = searchTerm.value.toLowerCase().trim();
  if (!q) return store.users;
  return store.users.filter((u) =>
    u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q) || (u.specialty && u.specialty.toLowerCase().includes(q))
  );
});

function openCreate() {
  editingUser.value = null;
  form.value = emptyForm();
  formError.value = '';
  showForm.value = true;
}

function openEdit(user: User) {
  editingUser.value = user;
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    specialty: user.specialty || '',
    phone: user.phone || '',
    active: user.active,
    avatarUrl: user.avatarUrl || '',
  };
  formError.value = '';
  showForm.value = true;
}

async function saveUser() {
  formError.value = '';
  isSaving.value = true;
  try {
    if (editingUser.value) {
      const user = editingUser.value;
      await store.updateUser(user.id, {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
        specialty: form.value.specialty,
        phone: form.value.phone,
        active: form.value.active,
        avatarUrl: form.value.avatarUrl,
      });
      if (form.value.password) await store.resetUserPassword(user.id, form.value.password);
    } else {
      await store.addUser({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
        specialty: form.value.specialty,
        phone: form.value.phone,
        avatarUrl: form.value.avatarUrl,
      });
    }
    showForm.value = false;
  } catch (error: any) {
    formError.value = error?.message || 'No se pudo guardar el usuario.';
  } finally {
    isSaving.value = false;
  }
}

async function toggleUser(user: User) {
  pageError.value = '';
  try {
    await store.updateUser(user.id, { active: !user.active });
  } catch (error: any) {
    pageError.value = error?.message || 'No se pudo cambiar el estado del usuario.';
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="font-heading font-extrabold text-2xl text-[#1d1c16]">Gestión de Usuarios y Roles</h2>
        <p class="text-xs text-[#6d7a77]">Crea cuentas, actualiza perfiles y habilita o deshabilita el acceso.</p>
      </div>
      <button @click="openCreate" class="px-4 py-2.5 bg-[#00685d] hover:bg-[#008376] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer">
        <span class="material-symbols-outlined text-base">person_add</span>
        Nuevo usuario
      </button>
    </div>

    <div class="p-5 bg-[#f8f3ea] rounded-2xl border border-[#bcc9c6] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
      <div class="p-3 bg-white rounded-xl border border-[#ece8df]"><b class="text-[#00685d]">ADMINISTRADOR</b><p class="mt-1 text-[#3d4947]">Control total y administración de usuarios.</p></div>
      <div class="p-3 bg-white rounded-xl border border-[#ece8df]"><b class="text-[#a33d23]">RECEPCIONISTA</b><p class="mt-1 text-[#3d4947]">Pacientes, solicitudes, citas, pagos y su caja.</p></div>
      <div class="p-3 bg-white rounded-xl border border-[#ece8df]"><b class="text-[#455f73]">PROFESIONAL</b><p class="mt-1 text-[#3d4947]">Agenda asignada, citas y materiales de pacientes.</p></div>
    </div>

    <div v-if="pageError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">{{ pageError }}</div>

    <div class="bg-white p-4 rounded-2xl border border-[#e7e2d9] flex items-center justify-between gap-4">
      <input v-model="searchTerm" type="search" placeholder="Buscar por nombre, correo o rol..." class="w-full max-w-sm h-10 px-3 rounded-xl bg-[#f8f3ea] border border-[#bcc9c6] text-xs focus:outline-none focus:ring-2 focus:ring-[#00685d]" />
      <span class="text-xs text-[#6d7a77]">Total: <strong>{{ filteredUsers.length }}</strong></span>
    </div>

    <div class="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#f8f3ea] border-b border-[#ece8df] text-[#6d7a77] uppercase font-bold text-[11px]">
          <tr><th class="py-3 px-4">Usuario</th><th class="py-3 px-4">Rol</th><th class="py-3 px-4">Especialidad</th><th class="py-3 px-4">Teléfono</th><th class="py-3 px-4">Estado</th><th class="py-3 px-4">Acciones</th></tr>
        </thead>
        <tbody class="divide-y divide-[#ece8df]">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-[#fef9f0]">
            <td class="py-3 px-4"><div class="font-bold text-sm">{{ user.name }}</div><div class="text-[11px] text-[#6d7a77]">{{ user.email }}</div></td>
            <td class="py-3 px-4">{{ user.role === 'ADMIN' ? 'Administrador' : user.role === 'RECEPCION' ? 'Recepcionista' : 'Profesional' }}</td>
            <td class="py-3 px-4">{{ user.specialty || '—' }}</td>
            <td class="py-3 px-4">{{ user.phone || '—' }}</td>
            <td class="py-3 px-4"><span :class="user.active ? 'text-[#00685d]' : 'text-gray-500'">{{ user.active ? 'Activo' : 'Inactivo' }}</span></td>
            <td class="py-3 px-4"><div class="flex gap-2"><button @click="openEdit(user)" class="px-2.5 py-1 rounded-lg bg-[#f8f3ea] text-[#00685d] font-bold">Editar</button><button @click="toggleUser(user)" :disabled="user.id === store.currentUser?.id" class="px-2.5 py-1 rounded-lg font-bold disabled:opacity-40" :class="user.active ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e0f5ee] text-[#00685d]'">{{ user.active ? 'Deshabilitar' : 'Habilitar' }}</button></div></td>
          </tr>
          <tr v-if="filteredUsers.length === 0"><td colspan="6" class="p-8 text-center text-[#6d7a77]">No hay usuarios para mostrar.</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div><h3 class="font-heading font-bold text-lg">{{ editingUser ? 'Editar usuario' : 'Crear usuario' }}</h3><p class="text-xs text-[#6d7a77] mt-1">Los datos se guardan en la base de datos.</p></div>
        <div v-if="formError" role="alert" class="p-3 rounded-xl bg-[#ffdad2] text-[#731a04] text-xs">{{ formError }}</div>
        <ImageUploadField v-model="form.avatarUrl" label="Foto de perfil" :alt="form.name || 'Usuario'" />
        <form @submit.prevent="saveUser" class="space-y-3 text-xs">
          <label class="block font-bold">Nombre<input v-model="form.name" required maxlength="120" class="mt-1 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] font-normal" /></label>
          <label class="block font-bold">Correo electrónico<input v-model="form.email" required type="email" maxlength="160" class="mt-1 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] font-normal" /></label>
          <label class="block font-bold">{{ editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña inicial' }}<input v-model="form.password" :required="!editingUser" type="password" minlength="8" autocomplete="new-password" class="mt-1 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] font-normal" /><span class="block mt-1 text-[10px] text-[#6d7a77]">Mínimo 8 caracteres.</span></label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="block font-bold">Rol<select v-model="form.role" class="mt-1 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] bg-white font-normal"><option value="ADMIN">Administrador</option><option value="RECEPCION">Recepcionista</option><option value="PROFESIONAL">Profesional</option></select></label>
            <label class="block font-bold">Teléfono<input v-model="form.phone" maxlength="40" class="mt-1 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] font-normal" /></label>
          </div>
          <label class="block font-bold">Especialidad o área<input v-model="form.specialty" maxlength="120" class="mt-1 w-full px-3 py-2 rounded-xl border border-[#bcc9c6] font-normal" /></label>
          <label v-if="editingUser" class="flex items-center gap-2"><input v-model="form.active" type="checkbox" /> Usuario activo</label>
          <div class="flex justify-end gap-2 pt-3 border-t border-[#ece8df]"><button type="button" @click="showForm = false" class="px-4 py-2 bg-[#f2ede4] rounded-xl font-bold">Cancelar</button><button type="submit" :disabled="isSaving" class="px-5 py-2 bg-[#00685d] text-white rounded-xl font-bold disabled:opacity-50">{{ isSaving ? 'Guardando…' : 'Guardar' }}</button></div>
        </form>
      </div>
    </div>
  </div>
</template>
