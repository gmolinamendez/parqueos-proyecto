import api from './api';

export const vehicleService = {
  getAll: (page = 1, size = 100) => api.get(`/vehiculos?page=${page}&size=${size}`).then(r => r.data),
  getById: (id) => api.get(`/vehiculos/${id}`).then(r => r.data),
  searchByPlate: (placa) => api.get(`/vehiculos/buscar?placa=${encodeURIComponent(placa)}`).then(r => r.data),
  create: (data) => api.post('/vehiculos', data).then(r => r.data),
  update: (id, data) => api.put(`/vehiculos/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/vehiculos/${id}`).then(r => r.data),
};
