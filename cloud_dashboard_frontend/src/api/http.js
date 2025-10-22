import axios from 'axios';

/**
 * Axios instance configured for the dashboard API.
 * - Base URL from REACT_APP_API_BASE_URL
 * - Attaches Authorization header if token exists in localStorage
 * - Centralized 401 handling: dispatches a global event to trigger logout+redirect
 */
const baseURL = process.env.REACT_APP_API_BASE_URL || '';

const http = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach Authorization header if token available
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response error handling: auto logout on 401
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      // broadcast unauthorized so AuthContext can react
      try {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default http;
