import api from './api';

export const userService = {
  getAll: () => api.get('/usuarios').then(r => r.data),
  getById: (id) => api.get(`/usuarios/${id}`).then(r => r.data),
  create: (data) => api.post('/usuarios', data).then(r => r.data),
  update: (id, data) => api.put(`/usuarios/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/usuarios/${id}`).then(r => r.data),
};
