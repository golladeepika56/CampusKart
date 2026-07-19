import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: apiBaseUrl.endsWith('/api')
    ? apiBaseUrl
    : `${apiBaseUrl.replace(/\/$/, '')}/api`,
});

// Attach the JWT (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campuskart_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// If the token is invalid/expired, boot the user back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('campuskart_token');
      localStorage.removeItem('campuskart_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
