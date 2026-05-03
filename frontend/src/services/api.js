const API_URL = 'https://n8n-bot-back-visa-treep.gnuu1e.easypanel.host/api';

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
    const response = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Appointments Methods
  async getAppointments() {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createAppointment(data) {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};
