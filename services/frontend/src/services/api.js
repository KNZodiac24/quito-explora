const API_BASE = '/api';

export const api = {
  // Auth
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(data) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST'
    });
    return response.json();
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  // Eventos
  async getEventos(token) {
    const response = await fetch(`${API_BASE}/eventos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async getEvento(id, token) {
    const response = await fetch(`${API_BASE}/eventos/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async createEvento(data, token) {
    const response = await fetch(`${API_BASE}/eventos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateEvento(id, data, token) {
    const response = await fetch(`${API_BASE}/eventos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteEvento(id, token) {
    const response = await fetch(`${API_BASE}/eventos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async uploadImage(file, token) {
    const formData = new FormData();
    formData.append('imagen', file);

    const response = await fetch(`${API_BASE}/eventos/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  // Chat
  async getChatMessages(eventoId, token, limit = 50) {
    const response = await fetch(`${API_BASE}/chat/${eventoId}?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async sendChatMessage(eventoId, contenido, token) {
    const response = await fetch(`${API_BASE}/chat/${eventoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contenido })
    });
    return response.json();
  },

  // WebSocket URL
  getWebSocketUrl(token, eventoId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws?token=${token}&eventoId=${eventoId}`;
  }
};
