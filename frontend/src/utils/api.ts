import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

// Create Axios client with default configurations
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('af_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Custom header to let backend know our overridden role (if any)
    const activeRole = localStorage.getItem('af_active_role');
    if (activeRole && config.headers) {
      config.headers['X-Active-Role'] = activeRole;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to intercept auth errors (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid/expired - force logout
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
