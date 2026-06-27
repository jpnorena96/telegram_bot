const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api'
  : 'https://n8n-bot-back-visa-treep.gnuu1e.easypanel.host/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Error en la petición al servidor');
  }
  return response.json();
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Config
  url: API_URL,

  // Auth Methods
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  async register(data) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Users Methods
  async getUsers() {
    const response = await fetch(`${API_URL}/users/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async updateUser(id, data) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Appointments Methods
  async getAppointments() {
    const response = await fetch(`${API_URL}/appointments/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createAppointment(data) {
    const response = await fetch(`${API_URL}/appointments/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // ── Admin Methods ──────────────────────────────────────────
  async getAdminSummary() {
    const r = await fetch(`${API_URL}/admin/summary`, { headers: getHeaders() });
    return handleResponse(r);
  },
  async getAdminUsers() {
    const r = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
    return handleResponse(r);
  },
  async getAdminUserAppointments(userId) {
    const r = await fetch(`${API_URL}/admin/users/${userId}/appointments`, { headers: getHeaders() });
    return handleResponse(r);
  },
  async getAdminAllAppointments() {
    const r = await fetch(`${API_URL}/admin/appointments`, { headers: getHeaders() });
    return handleResponse(r);
  },
  async adminCreateUser(data) {
    const r = await fetch(`${API_URL}/admin/users`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    });
    return handleResponse(r);
  },
  async adminUpdateUser(id, data) {
    const r = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
    });
    return handleResponse(r);
  },
  async adminDeleteUser(id) {
    const r = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE', headers: getHeaders(),
    });
    return handleResponse(r);
  },
  async getNotifications() {
    const response = await fetch(`${API_URL}/notifications/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async markNotificationsRead() {
    const response = await fetch(`${API_URL}/notifications/read`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async startAppointment(id) {
    const response = await fetch(`${API_URL}/appointments/${id}/start`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async stopAppointment(id) {
    const response = await fetch(`${API_URL}/appointments/${id}/stop`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async discoverDirect(data) {
    const response = await fetch(`${API_URL}/appointments/discover-direct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  async selectSchedule(appointmentId, scheduleId, scheduleNames = '') {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}/select-schedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ schedule_id: scheduleId, schedule_names: scheduleNames }),
    });
    return handleResponse(response);
  },
  getExportCsvUrl() {
    const token = localStorage.getItem('token');
    return `${API_URL}/admin/export/csv?token=${token}`;
  },
  async getVisaProcesses() {
    const response = await fetch(`${API_URL}/documents/processes`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async getVisaProcessDetails(processId) {
    const response = await fetch(`${API_URL}/documents/processes/${processId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async createVisaProcess(data) {
    const response = await fetch(`${API_URL}/documents/processes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  async updateVisaProcessStatus(processId, status) {
    const response = await fetch(`${API_URL}/documents/processes/${processId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
  async addVisaApplicant(processId, data) {
    const response = await fetch(`${API_URL}/documents/processes/${processId}/applicants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  async deleteVisaApplicant(processId, applicantId) {
    const response = await fetch(`${API_URL}/documents/processes/${processId}/applicants/${applicantId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  async uploadVisaDocument(applicantId, documentType, file) {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    
    const headers = getHeaders();
    delete headers['Content-Type']; // Let browser set boundary
    
    const response = await fetch(`${API_URL}/documents/applicants/${applicantId}/upload`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    return handleResponse(response);
  },
  async updateVisaDocumentStatus(documentId, status, notes = '') {
    const response = await fetch(`${API_URL}/documents/documents/${documentId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(response);
  },
  async downloadVisaDocument(documentId) {
    const response = await fetch(`${API_URL}/documents/download/${documentId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Error al descargar archivo');
    return response.blob();
  },
};
