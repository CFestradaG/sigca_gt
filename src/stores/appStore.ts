import { defineStore } from 'pinia';
import {
  User,
  Patient,
  Guardian,
  ClinicalService,
  Appointment,
  AppointmentRequest,
  Payment,
  DailyCashRegister,
  EducationalMaterial,
  InstitutionalContent,
  ContactMessage,
} from '../types';
import {
  initialUsers,
  initialPatients,
  initialGuardians,
  initialServices,
  initialAppointments,
  initialRequests,
  initialPayments,
  initialCashRegister,
  initialMaterials,
  initialContent,
  initialMessages,
} from '../data/mockData';

const TOKEN_KEY = 'sigca_jwt_token';
const USER_KEY = 'sigca_auth_user';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getStoredUser(): User | null {
  // A browser cache is not proof of identity. The server session is restored via /auth/me.
  return null;
}

function emptyCashRegister(): DailyCashRegister {
  return {
    id: '',
    usuarioId: '',
    fecha: '',
    fechaApertura: '',
    estado: 'CERRADA',
    montoInicialQ: 0,
    usuarioNombre: '',
    horaApertura: '',
    totalEfectivoQ: 0,
    totalTransferenciasQ: 0,
    totalTarjetaQ: 0,
    totalIngresosQ: 0,
    efectivoEsperadoQ: 0,
    efectivoContadoQ: undefined,
    diferenciaQ: undefined,
    movimientos: [],
  };
}

function mapApiUser(user: any): User {
  return {
    id: user.id,
    name: user.nombre ?? user.name,
    email: user.email,
    role: user.rol ?? user.role,
    active: user.activo ?? user.active ?? true,
    phone: user.telefono ?? user.phone,
    specialty: user.especialidad ?? user.specialty,
    avatarUrl: user.avatarUrl,
  };
}

function mapApiPatient(patient: any): Patient {
  return { ...patient, photoUrl: patient.fotoUrl ?? patient.photoUrl ?? '' };
}

function mapApiGuardian(guardian: any): Guardian {
  return { ...guardian, photoUrl: guardian.fotoUrl ?? guardian.photoUrl ?? '' };
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}: ${res.statusText}`);
  }
  return data;
}

export const useAppStore = defineStore('app', {
  state: () => ({
    authToken: getStoredToken(),
    currentUser: getStoredUser(),
    authReady: !getStoredToken(),
    lastAuthError: '',
    activeRoleView: null as User['role'] | null,
    selectedSite: 'todas' as 'todas' | 'z10' | 'z14' | 'online',
    globalSearchTerm: '',
    selectedPatientId: 'pac-1' as string | null,
    selectedPaymentForPrint: null as Payment | null,

    // Fixtures initialize the interface; successful API responses replace them.
    users: initialUsers as User[],
    patients: initialPatients as Patient[],
    guardians: initialGuardians as Guardian[],
    services: initialServices as ClinicalService[],
    appointments: initialAppointments as Appointment[],
    requests: initialRequests as AppointmentRequest[],
    payments: initialPayments as Payment[],
    cashRegister: initialCashRegister as DailyCashRegister,
    allCashRegisters: [] as any[],
    materials: initialMaterials as EducationalMaterial[],
    content: initialContent as InstitutionalContent,
    messages: initialMessages as ContactMessage[],

    isLoadingData: false,
    apiConnected: false,
  }),

  getters: {
    pendingRequestsCount(state): number {
      return state.requests.filter((r) => r.estado === 'PENDIENTE').length;
    },
    unreadMessagesCount(state): number {
      return state.messages.filter((m) => !m.leido).length;
    },
  },

  actions: {
    async fetchInitialData() {
      this.isLoadingData = true;
      const role = this.currentUser?.role;
      const isAdmin = role === 'ADMIN';
      const canSeeFinance = role === 'ADMIN' || role === 'RECEPCION';
      const canSeeRequests = canSeeFinance;
      const canSeeMessages = role === 'ADMIN' || role === 'RECEPCION';
      const usersEndpoint = isAdmin ? '/api/usuarios' : '/api/usuarios/directorio';

      try {
        // Solo se consultan los módulos que el rol puede ver. Así la interfaz no
        // conserva fixtures financieros ficticios cuando la API responde 403.
        const [
          servicesRes,
          contentRes,
          patientsRes,
          guardiansRes,
          appointmentsRes,
          requestsRes,
          paymentsRes,
          cashRes,
          materialsRes,
          messagesRes,
          usersRes,
        ] = await Promise.allSettled([
          apiFetch('/api/servicios?all=true'),
          apiFetch('/api/contenido'),
          apiFetch('/api/pacientes'),
          apiFetch('/api/responsables'),
          apiFetch('/api/citas'),
          canSeeRequests ? apiFetch('/api/solicitudes-cita') : Promise.resolve({ success: true, data: [] }),
          canSeeFinance ? apiFetch('/api/pagos') : Promise.resolve({ success: true, data: [] }),
          canSeeFinance
            ? apiFetch('/api/cajas/actual')
            : Promise.resolve({ success: true, hasOpenRegister: false, data: null }),
          apiFetch('/api/materiales'),
          canSeeMessages ? apiFetch('/api/contacto') : Promise.resolve({ success: true, data: [] }),
          apiFetch(usersEndpoint),
        ]);

        if (servicesRes.status === 'fulfilled' && servicesRes.value.data) {
          this.services = servicesRes.value.data;
        }
        if (contentRes.status === 'fulfilled' && contentRes.value.data) {
          this.content = contentRes.value.data;
        }
        if (patientsRes.status === 'fulfilled' && patientsRes.value.data) {
          this.patients = patientsRes.value.data.map(mapApiPatient);
        }
        if (guardiansRes.status === 'fulfilled' && guardiansRes.value.data) {
          this.guardians = guardiansRes.value.data.map(mapApiGuardian);
        }
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data) {
          this.appointments = appointmentsRes.value.data;
        }
        if (requestsRes.status === 'fulfilled') {
          this.requests = requestsRes.value.data || [];
        }
        if (paymentsRes.status === 'fulfilled') {
          this.payments = paymentsRes.value.data || [];
        }
        if (cashRes.status === 'fulfilled') {
          this.cashRegister = cashRes.value?.data ? cashRes.value.data : emptyCashRegister();
        } else {
          this.cashRegister = emptyCashRegister();
        }
        if (materialsRes.status === 'fulfilled' && materialsRes.value.data) {
          this.materials = materialsRes.value.data;
        }
        if (messagesRes.status === 'fulfilled') {
          this.messages = messagesRes.value.data || [];
        }
        if (usersRes.status === 'fulfilled' && usersRes.value.data) {
          this.users = usersRes.value.data.map((u: any) => ({
            id: u.id,
            name: u.nombre,
            email: u.email || '',
            role: u.rol,
            active: u.activo !== undefined ? u.activo : true,
            phone: u.telefono,
            specialty: u.especialidad,
            avatarUrl: u.avatarUrl,
          }));
        }

        this.apiConnected = servicesRes.status === 'fulfilled';
      } catch (err) {
        this.apiConnected = false;
        console.error('No se pudieron cargar los datos del servidor:', err);
      } finally {
        this.isLoadingData = false;
      }
    },

    async fetchCashRegisters() {
      try {
        const res = await apiFetch('/api/cajas');
        if (res.data) this.allCashRegisters = res.data;
      } catch (err) {
        console.error('No se pudo cargar el historial de cajas:', err);
      }
    },

    async login(email: string, pass: string): Promise<boolean> {
      this.lastAuthError = '';
      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: pass }),
        });

        if (res.success && res.token && res.user) {
          this.authToken = res.token;
          const userFormatted = mapApiUser(res.user);
          this.currentUser = userFormatted;
          this.activeRoleView = userFormatted.role;

          try {
            localStorage.setItem(TOKEN_KEY, res.token);
            localStorage.setItem(USER_KEY, JSON.stringify(userFormatted));
          } catch (e) {
            console.error(e);
          }

          await this.fetchInitialData();
          return true;
        }
        return false;
      } catch (err: any) {
        this.lastAuthError = err.message || 'Error al autenticar';
        return false;
      } finally {
        this.authReady = true;
      }
    },

    async restoreSession(): Promise<boolean> {
      if (!this.authToken) {
        this.currentUser = null;
        this.authReady = true;
        return false;
      }
      try {
        const res = await apiFetch('/api/auth/me');
        if (!res.success || !res.user) throw new Error('Sesión no válida');
        this.currentUser = mapApiUser(res.user);
        this.activeRoleView = this.currentUser.role;
        this.authReady = true;
        if (!this.currentUser.active) {
          this.logout();
          return false;
        }
        return true;
      } catch {
        this.logout();
        return false;
      }
    },

    async updateOwnAvatar(avatarUrl: string): Promise<User> {
      const res = await apiFetch('/api/auth/me/avatar', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl }),
      });
      if (!res.user) throw new Error('El servidor no devolvió el perfil actualizado.');
      this.currentUser = mapApiUser(res.user);
      return this.currentUser;
    },

    async addUser(input: {
      name: string; email: string; password: string; role: User['role'];
      phone?: string; specialty?: string; avatarUrl?: string;
    }): Promise<User> {
      const res = await apiFetch('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: input.name.trim(), email: input.email.trim(), password: input.password,
          rol: input.role, telefono: input.phone?.trim(), especialidad: input.specialty?.trim(),
          avatarUrl: input.avatarUrl,
        }),
      });
      if (!res.data) throw new Error('El servidor no devolvió el usuario creado.');
      const user = mapApiUser(res.data);
      this.users.unshift(user);
      return user;
    },

    async updateUser(id: string, input: Partial<Omit<User, 'id'>>): Promise<User> {
      const res = await apiFetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: input.name?.trim(), email: input.email?.trim(), rol: input.role,
          telefono: input.phone?.trim(), especialidad: input.specialty?.trim(),
          avatarUrl: input.avatarUrl, activo: input.active,
        }),
      });
      if (!res.data) throw new Error('El servidor no devolvió el usuario actualizado.');
      const user = mapApiUser(res.data);
      const index = this.users.findIndex((item) => item.id === id);
      if (index !== -1) this.users[index] = user;
      return user;
    },

    async resetUserPassword(id: string, newPassword: string): Promise<void> {
      await apiFetch(`/api/usuarios/${id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      });
    },

    logout() {
      this.authToken = null;
      this.currentUser = null;
      this.authReady = true;
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      } catch (e) {
        console.error(e);
      }
    },

    setCurrentUser(user: User | null) {
      this.currentUser = user;
      this.authReady = true;
      if (user) {
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {}
      }
    },

    setActiveRoleView(role: User['role']) { this.activeRoleView = role; },
    setSelectedSite(site: 'todas' | 'z10' | 'z14' | 'online') { this.selectedSite = site; },
    setGlobalSearchTerm(term: string) { this.globalSearchTerm = term; },

    setSelectedPatientId(id: string | null) {
      this.selectedPatientId = id;
    },

    setSelectedPaymentForPrint(payment: Payment | null) {
      this.selectedPaymentForPrint = payment;
    },

    calculateAge(birthDate: string): { years: number; months: number; text: string } {
      if (!birthDate) return { years: 0, months: 0, text: 'No especificada' };
      const birth = new Date(birthDate);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
        years--;
        months = (months + 12) % 12;
      }
      return {
        years,
        months,
        text: `${years} años${months > 0 ? `, ${months} meses` : ''}`,
      };
    },

    isMinor(birthDate: string): boolean {
      const age = this.calculateAge(birthDate);
      return age.years < 18;
    },

    getPatientGuardians(patientId: string): Guardian[] {
      return this.guardians.filter((g) => g.patientIds?.includes(patientId));
    },

    getPatientAppointments(patientId: string): Appointment[] {
      return this.appointments.filter((a) => a.pacienteId === patientId);
    },

    getPatientPayments(patientId: string): Payment[] {
      return this.payments.filter((p) => p.pacienteId === patientId);
    },

    getPatientBalance(patientId: string): { totalCharged: number; totalPaid: number; balance: number } {
      const pApts = this.getPatientAppointments(patientId);
      const totalCharged = pApts
        .filter((a) => a.estado !== 'CANCELADA')
        .reduce((sum, a) => sum + (a.precioQ || 0), 0);
      const pPays = this.getPatientPayments(patientId);
      const validPayments = pPays.filter((p: any) => p.estado !== 'ANULADO');
      const totalPaid = validPayments.reduce((sum, p) => sum + (p.montoQ || 0), 0);
      return {
        totalCharged,
        totalPaid,
        balance: Math.max(0, Math.round((totalCharged - totalPaid) * 100) / 100),
      };
    },

    // --- PATIENTS ---
    async addPatient(patientData: Omit<Patient, 'id'>): Promise<Patient> {
      try {
        const res = await apiFetch('/api/pacientes', {
          method: 'POST',
          body: JSON.stringify({ ...patientData, fotoUrl: patientData.photoUrl }),
        });
        if (!res.data) throw new Error('El servidor no devolvió el paciente registrado.');
        const patient = mapApiPatient(res.data);
        this.patients.unshift(patient);
        return patient;
      } catch (err: any) { throw new Error(err.message || 'Error al registrar el paciente'); }
    },

    async updatePatient(id: string, updated: Partial<Patient>) {
      const res = await apiFetch(`/api/pacientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updated, ...(updated.photoUrl !== undefined ? { fotoUrl: updated.photoUrl } : {}) }),
      });
      if (!res.data) throw new Error('El servidor no devolvió el paciente actualizado.');
      const idx = this.patients.findIndex((p) => p.id === id);
      if (idx !== -1) this.patients[idx] = mapApiPatient(res.data);
    },

    async togglePatientStatus(id: string) {
      const p = this.patients.find((pt) => pt.id === id);
      if (!p) return;
      const nextStatus = p.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      try {
        await apiFetch(`/api/pacientes/${id}/estado`, {
          method: 'PATCH',
          body: JSON.stringify({ estado: nextStatus }),
        });
      } catch (err) { throw err; }
      p.estado = nextStatus;
    },

    // --- GUARDIANS ---
    async addGuardian(gData: Omit<Guardian, 'id'>): Promise<Guardian> {
      try {
        const res = await apiFetch('/api/responsables', {
          method: 'POST',
          body: JSON.stringify({ ...gData, fotoUrl: gData.photoUrl }),
        });
        if (!res.data) throw new Error('El servidor no devolvió el responsable registrado.');
        const guardian = mapApiGuardian(res.data);
        this.guardians.push(guardian);
        return guardian;
      } catch (err) { throw err; }
    },

    async updateGuardian(id: string, updated: Partial<Guardian>) {
      const res = await apiFetch(`/api/responsables/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updated, ...(updated.photoUrl !== undefined ? { fotoUrl: updated.photoUrl } : {}) }),
      });
      if (!res.data) throw new Error('El servidor no devolvió el responsable actualizado.');
      const idx = this.guardians.findIndex((g) => g.id === id);
      if (idx !== -1) this.guardians[idx] = mapApiGuardian(res.data);
    },

    async linkGuardianToPatient(guardianId: string, patientId: string) {
      const g = this.guardians.find((gua) => gua.id === guardianId);
      if (g && !g.patientIds.includes(patientId)) {
        const nextIds = [...g.patientIds, patientId];
        await this.updateGuardian(guardianId, { patientIds: nextIds });
      }
    },

    // --- SERVICES ---
    async addService(srvData: Omit<ClinicalService, 'id'>) {
      try {
        const res = await apiFetch('/api/servicios', {
          method: 'POST',
          body: JSON.stringify(srvData),
        });
        if (!res.data) throw new Error('El servidor no devolvió el servicio registrado.');
        this.services.push(res.data);
        return;
      } catch (err) { throw err; }
    },

    async updateService(id: string, updated: Partial<ClinicalService>) {
      try {
        const res = await apiFetch(`/api/servicios/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updated),
        });
        if (res.data) {
          const idx = this.services.findIndex((s) => s.id === id);
          if (idx !== -1) this.services[idx] = res.data;
          return;
        }
      } catch (err) { throw err; }
      const idx = this.services.findIndex((s) => s.id === id);
      if (idx !== -1) this.services[idx] = { ...this.services[idx], ...updated };
    },

    // --- REQUESTS ---
    async submitAppointmentRequest(req: Omit<AppointmentRequest, 'id' | 'estado' | 'fechaCreacion'>) {
      try {
        const res = await apiFetch('/api/solicitudes-cita', {
          method: 'POST',
          body: JSON.stringify(req),
        });
        if (!res.data) throw new Error('El servidor no devolvió la solicitud registrada.');
        this.requests.unshift(res.data);
        return res.data;
      } catch (err) { throw err; }
    },

    async updateRequestStatus(id: string, status: 'PENDIENTE' | 'ATENDIDA' | 'RECHAZADA') {
      try {
        await apiFetch(`/api/solicitudes-cita/${id}/estado`, {
          method: 'PATCH',
          body: JSON.stringify({ estado: status }),
        });
      } catch (err) { throw err; }
      const r = this.requests.find((req) => req.id === id);
      if (r) r.estado = status;
    },

    // --- APPOINTMENTS ---
    async createAppointment(aptData: Omit<Appointment, 'id' | 'fechaCreacion'>): Promise<Appointment> {
      try {
        const res = await apiFetch('/api/citas', {
          method: 'POST',
          body: JSON.stringify(aptData),
        });
        if (!res.data) throw new Error('El servidor no devolvió la cita programada.');
        this.appointments.unshift(res.data);
        return res.data;
      } catch (err: any) {
        throw new Error(err.message || 'Error al programar la cita');
      }
    },

    async updateAppointmentStatus(id: string, status: Appointment['estado']) {
      try {
        const res = await apiFetch(`/api/citas/${id}/estado`, {
          method: 'PATCH',
          body: JSON.stringify({ estado: status }),
        });
        if (res.data) {
          const idx = this.appointments.findIndex((a) => a.id === id);
          if (idx !== -1) this.appointments[idx] = res.data;
          return;
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al cambiar estado de cita');
      }
      const apt = this.appointments.find((a) => a.id === id);
      if (apt) apt.estado = status;
    },

    async rescheduleAppointment(id: string, fecha: string, horaInicio: string, horaFin: string) {
      try {
        const res = await apiFetch(`/api/citas/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ fecha, horaInicio }),
        });
        if (res.data) {
          const idx = this.appointments.findIndex((a) => a.id === id);
          if (idx !== -1) this.appointments[idx] = res.data;
          return;
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al reprogramar la cita');
      }
      const apt = this.appointments.find((a) => a.id === id);
      if (apt) {
        apt.fecha = fecha;
        apt.horaInicio = horaInicio;
        apt.horaFin = horaFin;
      }
    },

    async checkAppointmentAvailability(input: {
      pacienteId: string; servicioId: string; profesionalId: string; fecha: string;
      horaInicio: string; sede: string; idToIgnore?: string;
    }) {
      const query = new URLSearchParams();
      Object.entries(input).forEach(([key, value]) => {
        if (value) query.set(key, value);
      });
      try {
        const res = await apiFetch(`/api/citas/disponibilidad?${query.toString()}`);
        return res.data as { available: boolean; message: string; horaFin?: string; precioQ?: number };
      } catch (err: any) {
        if (err?.message === 'Cita no encontrada') {
          throw new Error('El servidor respondió 404 al consultar disponibilidad. Reinicia el backend para cargar la ruta /api/citas/disponibilidad y vuelve a intentar.');
        }
        throw err;
      }
    },

    // --- PAYMENTS & CAJA ---
    async registerPayment(paymentData: {
      citaId: string; montoQ: number; metodoPago: Payment['metodoPago']; concepto: string; notas?: string;
    }): Promise<Payment> {
      try {
        const res = await apiFetch('/api/pagos', {
          method: 'POST',
          body: JSON.stringify(paymentData),
        });
        if (!res.data) throw new Error('El servidor no devolvió el pago registrado.');
        this.payments.unshift(res.data);

          // Refresh cash register and appointments
          const cashRes = await apiFetch('/api/cajas/actual').catch(() => null);
          if (cashRes?.data) this.cashRegister = cashRes.data;

          const appsRes = await apiFetch('/api/citas').catch(() => null);
          if (appsRes?.data) this.appointments = appsRes.data;

        return res.data;
      } catch (err: any) {
        throw new Error(err.message || 'Error al registrar el pago');
      }

    },

    async annulPayment(paymentId: string, motivoAnulacion: string) {
      try {
        const res = await apiFetch(`/api/pagos/${paymentId}/anular`, {
          method: 'PATCH',
          body: JSON.stringify({ motivoAnulacion }),
        });
        if (res.data) {
          const idx = this.payments.findIndex((p) => p.id === paymentId);
          if (idx !== -1) this.payments[idx] = res.data;

          // Refresh cash register
          const cashRes = await apiFetch('/api/cajas/actual').catch(() => null);
          if (cashRes?.data) this.cashRegister = cashRes.data;

          return res.data;
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al anular el pago');
      }
    },

    async openCashRegister(montoInicialQ: number) {
      try {
        const res = await apiFetch('/api/cajas/abrir', {
          method: 'POST',
          body: JSON.stringify({ montoInicialQ }),
        });
        if (res.data) {
          this.cashRegister = res.data;
          return res.data;
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al abrir la caja diaria');
      }
    },

    async closeCashRegister(efectivoContadoQ?: number, observaciones?: string) {
      try {
        const cajaId = this.cashRegister.id;
        const res = await apiFetch(`/api/cajas/${cajaId}/cerrar`, {
          method: 'POST',
          body: JSON.stringify({
            efectivoContadoQ: efectivoContadoQ !== undefined ? efectivoContadoQ : this.cashRegister.montoInicialQ,
            observaciones,
          }),
        });
        if (res.data) {
          this.cashRegister = res.data;
          return res.data;
        }
      } catch (err: any) {
        throw new Error(err.message || 'Error al cerrar la caja');
      }
    },

    // --- MATERIALS ---
    async addMaterial(mat: Omit<EducationalMaterial, 'id' | 'fechaRegistro'>) {
      try {
        const res = await apiFetch('/api/materiales', {
          method: 'POST',
          body: JSON.stringify(mat),
        });
        if (!res.data) throw new Error('El servidor no devolvió el material registrado.');
        this.materials.push(res.data);
        return res.data;
      } catch (err) { throw err; }
    },

    async updateMaterial(id: string, updated: Partial<EducationalMaterial>) {
      try {
        const res = await apiFetch(`/api/materiales/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updated),
        });
        if (!res.data) throw new Error('El servidor no devolvió el material actualizado.');
        const idx = this.materials.findIndex((m) => m.id === id);
        if (idx !== -1) this.materials[idx] = res.data;
        return;
      } catch (err) { throw err; }
    },

    async assignMaterialToPatient(materialId: string, patientId: string) {
      try {
        const res = await apiFetch(`/api/materiales/${materialId}/asignar`, {
          method: 'POST',
          body: JSON.stringify({ pacienteId: patientId }),
        });
        if (!res.data) throw new Error('El servidor no devolvió la asignación actualizada.');
        const idx = this.materials.findIndex((m) => m.id === materialId);
        if (idx !== -1) this.materials[idx] = res.data;
        return;
      } catch (err: any) {
        throw new Error(err.message || 'Error al asignar material');
      }
    },

    async removeMaterialFromPatient(materialId: string, patientId: string) {
      const mat = this.materials.find((m) => m.id === materialId);
      if (mat) {
        const assignedPatientIds = mat.assignedPatientIds.filter((id) => id !== patientId);
        await this.updateMaterial(materialId, { assignedPatientIds });
      }
    },

    // --- CONTENT & CONTACT ---
    async updateInstitutionalContent(updated: Partial<InstitutionalContent>) {
      try {
        const res = await apiFetch('/api/contenido', {
          method: 'PUT',
          body: JSON.stringify(updated),
        });
        if (res.data) {
          this.content = res.data;
          return;
        }
      } catch (err) { throw err; }
      this.content = { ...this.content, ...updated };
    },

    async submitContactMessage(msg: Omit<ContactMessage, 'id' | 'fecha' | 'leido'>) {
      try {
        const res = await apiFetch('/api/contacto', {
          method: 'POST',
          body: JSON.stringify(msg),
        });
        if (!res.data) throw new Error('El servidor no devolvió el mensaje registrado.');
        this.messages.unshift(res.data);
        return res.data;
      } catch (err) { throw err; }
    },

    async markMessageRead(id: string) {
      try {
        await apiFetch(`/api/contacto/${id}/leer`, { method: 'PATCH' });
      } catch (err) { throw err; }
      const m = this.messages.find((msg) => msg.id === id);
      if (m) m.leido = true;
    },
  },
});
