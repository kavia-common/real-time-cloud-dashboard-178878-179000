import axios from 'axios';

/**
 * Axios HTTP client with:
 * - Base URL from REACT_APP_API_BASE_URL (cloud_dashboard_frontend/.env), e.g., http://localhost:4000
 * - Authorization Bearer token injection from localStorage 'token'
 * - Global 401 handling -> clear session and redirect to /login
 * Note: Keep backend secrets (Mongo URI, JWT secret) only in backend .env; do not add them to frontend .env.
 */

// PUBLIC_INTERFACE
export const TOKEN_STORAGE_KEY = 'token';

// PUBLIC_INTERFACE
export function clearAuthAndRedirect() {
  /** Clears auth token and user info and redirects to /login. */
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('user');
  } catch (e) {
    // ignore storage errors
  }
  if (typeof window !== 'undefined') {
    // Preserve attempted path for better UX
    const current = window.location.pathname + window.location.search;
    const next = encodeURIComponent(current);
    if (window.location.pathname !== '/login') {
      window.location.href = `/login?next=${next}`;
    }
  }
}

const baseURL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000').trim();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Attach bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } else if (config.headers?.Authorization) {
        delete config.headers.Authorization;
      }
    } catch {
      // ignore storage access errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle global responses: logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;
