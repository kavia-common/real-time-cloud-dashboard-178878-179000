/**
 * Axios HTTP client configuration with interceptors.
 * - Adds Authorization Bearer token from localStorage
 * - Handles 401 Unauthorized by clearing auth and redirecting to login
 * - Emits diagnostics for blocked requests (ad/tracker blockers)
 * - Exposes health check and safe GET helpers
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

// Create axios instance (always use baseURL)
const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // Explicit default headers to avoid CORS preflight surprises on simple requests where possible
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
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

// Response interceptor to handle 401 globally and log diagnostics
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Diagnostics for blocked-by-client or CORS-like network failures
    const isNetworkLevel =
      !error.response &&
      (error.code === 'ERR_NETWORK' ||
        /Network Error/i.test(error.message || '') ||
        /Blocked by client/i.test(error.message || ''));

    if (isNetworkLevel) {
      // Provide guidance to console to help users whitelist
      // eslint-disable-next-line no-console
      console.warn(
        '[Auth] Network-level error. This may be caused by an ad/tracker blocker or CORS. ' +
          `Request: ${error.config?.method?.toUpperCase?.() || 'GET'} ${error.config?.baseURL || ''}${error.config?.url || ''}\n` +
          `Base URL: ${API_BASE_URL}\n` +
          'Tips: 1) Temporarily disable the ad blocker for this site; 2) Add an allow rule for the backend host; ' +
          '3) Ensure REACT_APP_API_BASE_URL is correct; 4) Check the browser console/network tab for details.'
      );
    }

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

// PUBLIC_INTERFACE
export const healthCheck = async () => {
  /**
   * Pings the backend to verify connectivity.
   * Tries /health then /ping as a fallback (some backends expose one or the other).
   * Returns true if any health endpoint returns 200 OK.
   */
  try {
    const res = await http.get('/health', { timeout: 3000 });
    return res.status >= 200 && res.status < 300;
  } catch {
    try {
      const res2 = await http.get('/ping', { timeout: 3000 });
      return res2.status >= 200 && res2.status < 300;
    } catch {
      return false;
    }
  }
};

// PUBLIC_INTERFACE
export const safeGetWithRetry = async (url, options = {}) => {
  /**
   * Performs a GET with one retry if the first call fails due to network/ad-block issues.
   * Ensures Authorization header is present when a token exists.
   */
  const token = getAccessToken();
  const cfg = {
    ...(options || {}),
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  try {
    return await http.get(url, cfg);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[HTTP] GET failed, retrying once:', url, err?.message || err);
    return http.get(url, cfg);
  }
};

export default http;
