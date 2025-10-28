import api from './http';

/**
 * Centralized API endpoints.
 * Keep paths relative to baseURL configured in http.js
 */
const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',

  // Users CRUD
  users: '/users', // GET (list), POST (create)
  userById: (id) => `/users/${id}`, // GET, PUT, DELETE

  // Metrics
  metrics: {
    stats: '/metrics/stats',
    activity: '/metrics/activity',
  },
};

// Slim helper APIs
export const apiAuth = {
  login: (payload) => api.post(endpoints.login, payload),
  register: (payload) => api.post(endpoints.register, payload),
  me: () => api.get(endpoints.me),
};

export const apiUsers = {
  list: (params) => api.get(endpoints.users, { params }),
  create: (payload) => api.post(endpoints.users, payload),
  update: (id, payload) => api.put(endpoints.userById(id), payload),
  remove: (id) => api.delete(endpoints.userById(id)),
};

export const apiMetrics = {
  stats: (params) => api.get(endpoints.metrics.stats, { params }),
  activity: (params) => api.get(endpoints.metrics.activity, { params }),
};

export default endpoints;
