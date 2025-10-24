import axios from 'axios';
import { endpoints } from './endpoints';

// A lightweight in-memory auth store to decouple axios from React imports directly.
// AuthContext will register itself here to allow 401 handling without circular deps.
const authBridge = {
  getToken: null,
  onUnauthorized: null,
};

// PUBLIC_INTERFACE
export function registerAuthBridge({ getToken, onUnauthorized }) {
  /**
   * Register callbacks used by the HTTP client to fetch token and handle 401s.
   * - getToken(): returns current auth token string or null
   * - onUnauthorized(): triggers logout flow and state reset
   */
  authBridge.getToken = typeof getToken === 'function' ? getToken : null;
  authBridge.onUnauthorized = typeof onUnauthorized === 'function' ? onUnauthorized : null;
}

// Create axios instance with base URL
const http = axios.create({
  baseURL: endpoints.base,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor: attach Authorization Bearer token if available
http.interceptors.request.use(
  (config) => {
    try {
      const token = authBridge.getToken ? authBridge.getToken() : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Non-blocking: if token retrieval fails, continue without Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto logout on 401
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      if (typeof authBridge.onUnauthorized === 'function') {
        try {
          authBridge.onUnauthorized();
        } catch {
          // swallow to avoid breaking error pipeline
        }
      }
    }
    return Promise.reject(error);
  }
);

// PUBLIC_INTERFACE
export default http;
