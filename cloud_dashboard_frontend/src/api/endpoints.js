//
// API endpoints mapping
// Keep simple and aligned with backend Express routers
//

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

const makePath = (base, path = '') => {
  const trimmed = `${base}`.replace(/\/+$/, '');
  const suffix = path ? `/${path.replace(/^\/+/, '')}` : '';
  return `${trimmed}${suffix}`;
};

// PUBLIC_INTERFACE
export const endpoints = {
  base: API_BASE,

  // Auth routes
  auth: {
    base: makePath(API_BASE, '/auth'),
    login: makePath(API_BASE, '/auth/login'),
    register: makePath(API_BASE, '/auth/register'),
    me: makePath(API_BASE, '/auth/me'),
  },

  // Users routes
  users: {
    base: makePath(API_BASE, '/users'),
    byId: (id) => makePath(API_BASE, `/users/${id}`),
  },

  // Metrics routes
  metrics: {
    base: makePath(API_BASE, '/metrics'),
    latest: makePath(API_BASE, '/metrics/latest'),
    stats: makePath(API_BASE, '/metrics/stats'),
    byId: (id) => makePath(API_BASE, `/metrics/${id}`),
  },
};

export default endpoints;
