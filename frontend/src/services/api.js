import axios from 'axios';

// En producción usamos Render como respaldo si Netlify no inyectó VITE_API_URL.
const productionApiUrl = 'https://parku-9bfn.onrender.com/api';
const apiBaseUrl =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? productionApiUrl : '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
