import axios from 'axios';

/**
 * Axios HTTP client with:
 * - Base URL from REACT_APP_API_BASE_URL
 * - Authorization Bearer token injection
 * - Global 401 handling -> broadcast unauthorized and redirect to /login
 */

// Simple listener registry to notify AuthContext on unauthorized without coupling
const listeners = new Set();

/**
 * PUBLIC_INTERFACE
 * Subscribe to global auth events (e.g., 'unauthorized').
 * Returns an unsubscribe function.
 */
export function subscribeAuth(listener) {
  /** Subscribe to unauthorized/logout notifications. Returns unsubscribe fn. */
  if (typeof listener === 'function') {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  return () => {};
}

function emitUnauthorized() {
  listeners.forEach((l) => {
    try {
      l('unauthorized');
    } catch {
      // ignore listener errors
    }
  });
}

/**
 * Determine base URL from environment with graceful fallback.
 * If REACT_APP_API_BASE_URL is not set, we will:
 *  - log a clear warning to console with guidance to set it
 *  - attempt a sensible default of http://localhost:4000
 * Note: endpoints use relative paths (e.g., /auth/login), so both
 * http://localhost:4000 and http://localhost:4000/api can work depending
 * on backend routing. Adjust your .env to match your backend prefix.
 */
let BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').trim();

if (!BASE_URL) {
  // Graceful warning to guide developers during setup
  // eslint-disable-next-line no-console
  console.warn(
    '[http] REACT_APP_API_BASE_URL is not set. Falling back to http://localhost:4000. ' +
      'Create cloud_dashboard_frontend/.env from .env.example and set REACT_APP_API_BASE_URL.'
  );
  BASE_URL = 'http://localhost:4000';
}

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: inject Bearer token if present in localStorage
http.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore storage issues
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response: handle 401 by clearing storage, emitting event, and redirecting to /login
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } catch {
        // ignore
      }
      emitUnauthorized();
      if (typeof window !== 'undefined') {
        const current = window.location.pathname + window.location.search;
        const next = encodeURIComponent(current);
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?next=${next}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// PUBLIC_INTERFACE
export default http;
