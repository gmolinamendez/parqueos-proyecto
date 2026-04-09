import api from './api';

export const movementService = {
  getActive: (parqueoId) => {
    const params = parqueoId ? `?parqueo_id=${parqueoId}` : '';
    return api.get(`/movimientos/activos${params}`).then(r => r.data);
  },
  getHistory: (params = {}) => {
    const query = new URLSearchParams();
    if (params.placa) query.set('placa', params.placa);
    if (params.parqueo_id) query.set('parqueo_id', params.parqueo_id);
    if (params.page) query.set('page', params.page);
    if (params.size) query.set('size', params.size);
    return api.get(`/movimientos/historial?${query}`).then(r => r.data);
  },
  registerEntry: (data) => api.post('/movimientos/entrada', data).then(r => r.data),
  registerExit: (data) => api.post('/movimientos/salida', data).then(r => r.data),
};
