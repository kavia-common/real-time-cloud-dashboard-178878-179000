const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/me',
  },
  users: {
    list: '/users',
    detail: (id) => `/users/${id}`,
    create: '/users',
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
  },
  metrics: {
    stats: '/metrics/stats',
    activity: '/metrics/activity',
  },
};

export default endpoints;
