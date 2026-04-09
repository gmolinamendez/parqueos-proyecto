import api from './api';

export const parkingService = {
  getAll: (page = 1, size = 100) => api.get(`/parqueos?page=${page}&size=${size}`).then(r => r.data),
  getById: (id) => api.get(`/parqueos/${id}`).then(r => r.data),
  create: (data) => api.post('/parqueos', data).then(r => r.data),
  update: (id, data) => api.put(`/parqueos/${id}`, data).then(r => r.data),
  getAvailability: (id) => api.get(`/parqueos/${id}/disponibilidad`).then(r => r.data),
};
