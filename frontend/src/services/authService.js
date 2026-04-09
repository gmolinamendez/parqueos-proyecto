import api from './api';

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const authService = {
  async login(email, contrasena) {
    const { data } = await api.post('/auth/login', { email, contrasena });
    return data;
  },

  getUserFromToken(token) {
    const payload = decodeJWT(token);
    if (!payload) return null;
    return { id: payload.sub, rol: payload.rol };
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
