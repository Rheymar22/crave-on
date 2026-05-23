import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  withCredentials: true,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('craveon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('craveon_token');
      localStorage.removeItem('craveon_user');
      window.location.href = '/login';
    }

    if (status === 403) {
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;