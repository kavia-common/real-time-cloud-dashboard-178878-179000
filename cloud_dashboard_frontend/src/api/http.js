/**
 * Axios HTTP client configuration with interceptors.
 * - Adds Authorization Bearer token from localStorage
 * - Handles 401 Unauthorized by clearing auth and redirecting to login
 */

import axios from 'axios';
import { API_BASE_URL } from './endpoints';

const ACCESS_TOKEN_KEY = 'rtcd_access_token';

// PUBLIC_INTERFACE
export const getAccessToken = () => {
  /** Returns JWT access token from localStorage (if any). */
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

// PUBLIC_INTERFACE
export const setAccessToken = (token) => {
  /** Saves JWT access token to localStorage. */
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

// Create axios instance
const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to attach Authorization header
http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear token and redirect to login
      setAccessToken(null);
      try {
        localStorage.removeItem('rtcd_user');
      } catch {
        // ignore
      }
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default http;
