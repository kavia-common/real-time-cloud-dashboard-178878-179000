import axios from 'axios';

/**
 * Axios instance configured for the dashboard API.
 * - Base URL from REACT_APP_API_BASE_URL
 * - Attaches Authorization header if token exists in localStorage
 * - Interceptors for handling errors and auth token refresh hooks (placeholder)
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

// Basic response error handling
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Example: if 401, you could trigger logout or token refresh logic here
    if (error?.response?.status === 401) {
      // Placeholder for future refresh/redirect
      // e.g., window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default http;
