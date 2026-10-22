import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAppStore } from '../stores/appStore';

// Public Views
import HomeView from '../views/public/HomeView.vue';
import ServicesView from '../views/public/ServicesView.vue';
import MissionVisionView from '../views/public/MissionVisionView.vue';
import EducationalView from '../views/public/EducationalView.vue';
import CorporateView from '../views/public/CorporateView.vue';
import ScheduleContactView from '../views/public/ScheduleContactView.vue';
import BookingRequestView from '../views/public/BookingRequestView.vue';

// Admin Views
import DashboardView from '../views/admin/DashboardView.vue';
import PatientsView from '../views/admin/PatientsView.vue';
import GuardiansView from '../views/admin/GuardiansView.vue';
import ServicesAdminView from '../views/admin/ServicesAdminView.vue';
import RequestsView from '../views/admin/RequestsView.vue';
import AppointmentsView from '../views/admin/AppointmentsView.vue';
import CalendarView from '../views/admin/CalendarView.vue';
import MaterialsView from '../views/admin/MaterialsView.vue';
import PaymentsView from '../views/admin/PaymentsView.vue';
import CashRegisterView from '../views/admin/CashRegisterView.vue';
import InstitutionalContentView from '../views/admin/InstitutionalContentView.vue';
import UsersView from '../views/admin/UsersView.vue';
import MessagesView from '../views/admin/MessagesView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/inicio' },
  { path: '/inicio', name: 'Home', component: HomeView },
  { path: '/servicios', name: 'Services', component: ServicesView },
  { path: '/mision-vision', name: 'MissionVision', component: MissionVisionView },
  { path: '/educativo', name: 'Educational', component: EducationalView },
  { path: '/corporativo', name: 'Corporate', component: CorporateView },
  { path: '/horarios-contacto', name: 'ScheduleContact', component: ScheduleContactView },
  { path: '/agendar-cita', name: 'BookingRequest', component: BookingRequestView },

  // Admin Routes with RBAC guards
  { path: '/admin', redirect: '/admin/dashboard' },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  },
  {
    path: '/admin/pacientes',
    name: 'AdminPatients',
    component: PatientsView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  },
  {
    path: '/admin/responsables',
    name: 'AdminGuardians',
    component: GuardiansView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION'] },
  },
  {
    path: '/admin/servicios',
    name: 'AdminServices',
    component: ServicesAdminView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION'] },
  },
  {
    path: '/admin/solicitudes',
    name: 'AdminRequests',
    component: RequestsView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION'] },
  },
  {
    path: '/admin/citas',
    name: 'AdminAppointments',
    component: AppointmentsView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  },
  {
    path: '/admin/calendario',
    name: 'AdminCalendar',
    component: CalendarView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  },
  {
    path: '/admin/materiales',
    name: 'AdminMaterials',
    component: MaterialsView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION', 'PROFESIONAL'] },
  },
  {
    path: '/admin/pagos',
    name: 'AdminPayments',
    component: PaymentsView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION'] },
  },
  {
    path: '/admin/caja-diaria',
    name: 'AdminCashRegister',
    component: CashRegisterView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'RECEPCION'] },
  },
  {
    path: '/admin/contenido',
    name: 'AdminContent',
    component: InstitutionalContentView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsers',
    component: UsersView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/admin/mensajes',
    name: 'AdminMessages',
    component: MessagesView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Interface Navigation Guards (RN-10, RF-02)
router.beforeEach(async (to) => {
  const store = useAppStore();

  if (to.meta.requiresAuth) {
    if (store.authToken && !store.currentUser) await store.restoreSession();
    if (!store.currentUser) {
      return { path: '/inicio', query: { loginRequired: 'true' } };
    }

    if (!store.currentUser.active) {
      store.logout();
      return { path: '/inicio', query: { userInactive: 'true' } };
    }

    const allowedRoles = (to.meta.roles as string[]) || [];
    const activeRole = store.activeRoleView || store.currentUser.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
      console.warn(`[Guard] Rol activo ${activeRole} no tiene acceso a ${to.path}. Redirigiendo a Dashboard.`);
      return { path: '/admin/dashboard', query: { accessDenied: 'true' } };
    }
  }
  return true;
});
