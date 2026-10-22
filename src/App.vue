<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from './stores/appStore';

import PublicHeader from './components/public/PublicHeader.vue';
import PublicFooter from './components/public/PublicFooter.vue';
import AdminSidebar from './components/admin/AdminSidebar.vue';
import AdminHeader from './components/admin/AdminHeader.vue';
import PrintableVoucherModal from './components/admin/PrintableVoucherModal.vue';
import LoginModal from './components/auth/LoginModal.vue';

const store = useAppStore();
const route = useRoute();

const isSidebarOpen = ref(false);
const isLoginModalOpen = ref(false);
const accessDeniedNotice = ref(false);

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

const closeVoucherModal = () => {
  store.setSelectedPaymentForPrint(null);
};

onMounted(async () => {
  if (store.authToken && !store.currentUser) await store.restoreSession();
  else store.authReady = true;
  await store.fetchInitialData();
});

watch(
  () => route.query,
  (query) => {
    if (query.loginRequired === 'true') {
      isLoginModalOpen.value = true;
    }
    if (query.accessDenied === 'true') {
      accessDeniedNotice.value = true;
      setTimeout(() => {
        accessDeniedNotice.value = false;
      }, 5000);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#fef9f0] text-[#1d1c16] antialiased">
    <!-- Access Denied Banner -->
    <div
      v-if="accessDeniedNotice"
      class="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-[#ffdad2] border border-[#ffb4a2] text-[#731a04] shadow-lg flex items-center gap-3 transition-all"
    >
      <span class="material-symbols-outlined text-2xl text-[#a33d23]">shield_lock</span>
      <div>
        <p class="text-xs font-bold">Acceso restringido</p>
        <p class="text-[11px]">Su rol actual ({{ store.currentUser?.role }}) no tiene permisos para ese módulo.</p>
      </div>
      <button @click="accessDeniedNotice = false" class="text-[#731a04] hover:opacity-75">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>

    <!-- Admin Interface -->
    <div v-if="isAdminRoute" class="flex min-h-screen">
      <!-- Admin Sidebar -->
      <AdminSidebar
        :isOpen="isSidebarOpen"
        @close="isSidebarOpen = false"
        @openLogin="isLoginModalOpen = true"
      />

      <!-- Main Admin Area -->
      <div class="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <AdminHeader
          @toggleSidebar="isSidebarOpen = !isSidebarOpen"
          @openLogin="isLoginModalOpen = true"
        />

        <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Public Portal -->
    <div v-else class="flex flex-col min-h-screen">
      <PublicHeader @openLogin="isLoginModalOpen = true" />

      <main class="flex-1 pt-28">
        <router-view />
      </main>

      <PublicFooter />
    </div>

    <!-- Global Printable Voucher Modal -->
    <PrintableVoucherModal
      v-if="store.selectedPaymentForPrint"
      :payment="store.selectedPaymentForPrint"
      @close="closeVoucherModal"
    />

    <!-- Global Login / Role Modal -->
    <LoginModal
      :isOpen="isLoginModalOpen"
      @close="isLoginModalOpen = false"
      @success="isLoginModalOpen = false"
    />
  </div>
</template>
