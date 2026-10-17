import axios from 'axios';

// Supports VITE_API_URL for production (Render backend), with automatic Render fallback in production and /api for local dev
const apiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://mern-todo-app-79tf.onrender.com/api'
    : '/api');

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT from sessionStorage (strictly token only)
api.interceptors.request.use(
  (config) => {
    // Only reading token from sessionStorage; no localStorage used
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token from sessionStorage
      sessionStorage.removeItem('token');

      // Redirect to login page if not already on an auth page
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/signup'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
