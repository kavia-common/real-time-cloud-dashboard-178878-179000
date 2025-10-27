import http from './http';

/**
 * PUBLIC_INTERFACE
 * Centralized API endpoint paths for the backend.
 * These are relative paths; the http client injects the baseURL and Authorization header.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  users: {
    root: '/users',
    byId: (id) => `/users/${id}`,
  },
  metrics: {
    stats: '/metrics/stats',
    activity: '/metrics/activity',
  },
};

/**
 * PUBLIC_INTERFACE
 * Thin API helpers for calling backend routes with types and response shapes documented.
 */
export const apiAuth = {
  /** Login with credentials. Returns { user, token } */
  login: (payload) => http.post(endpoints.auth.login, payload),
  /** Register user. Returns { user, token } */
  register: (payload) => http.post(endpoints.auth.register, payload),
  /** Validate current session, returns { user } */
  me: () => http.get(endpoints.auth.me),
};

export const apiUsers = {
  /** List users with optional query params */
  list: (params) => http.get(endpoints.users.root, { params }),
  /** Create a new user */
  create: (payload) => http.post(endpoints.users.root, payload),
  /** Update user by id */
  update: (id, payload) => http.put(endpoints.users.byId(id), payload),
  /** Delete user by id */
  remove: (id) => http.delete(endpoints.users.byId(id)),
};

export const apiMetrics = {
  /** Fetch aggregate stats for dashboard */
  stats: (params) => http.get(endpoints.metrics.stats, { params }),
  /** Fetch activity feed */
  activity: (params) => http.get(endpoints.metrics.activity, { params }),
};

export default endpoints;
