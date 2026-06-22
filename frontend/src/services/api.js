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
  getExportCsvUrl() {
    const token = localStorage.getItem('token');
    return `${API_URL}/admin/export/csv?token=${token}`;
  },
};
