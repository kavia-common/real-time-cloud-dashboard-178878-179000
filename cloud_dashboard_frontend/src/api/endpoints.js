/**
 * API endpoints mapping to backend routes.
 * Ensure REACT_APP_API_BASE_URL in .env points to backend (e.g., http://localhost:4000).
 */

// PUBLIC_INTERFACE
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const withBase = (path) => `${API_BASE_URL}${path}`;

// PUBLIC_INTERFACE
export const endpoints = {
  // Auth
  auth: {
    login: withBase('/auth/login'),
    register: withBase('/auth/register'),
    me: withBase('/auth/me'),
    logout: withBase('/auth/logout'),
  },

  // Users (admin-only)
  users: {
    list: withBase('/users'),
    create: withBase('/users'),
    detail: (id) => withBase(`/users/${id}`),
    update: (id) => withBase(`/users/${id}`),
    delete: (id) => withBase(`/users/${id}`),
  },

  // Metrics
  metrics: {
    stats: withBase('/metrics/stats'),
    activity: withBase('/metrics/activity'),
  },
};
