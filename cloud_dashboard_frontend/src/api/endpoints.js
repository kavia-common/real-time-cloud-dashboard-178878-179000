 /**
  * API endpoints mapping to backend routes.
  * Ensure REACT_APP_API_BASE_URL in .env points to backend (e.g., http://localhost:4000).
  * Optionally set REACT_APP_API_PATH_PREFIX (default: '') to proxy paths like '/api' to avoid adblock heuristics.
  */

 // PUBLIC_INTERFACE
 export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
 // PUBLIC_INTERFACE
 export const API_PATH_PREFIX = (process.env.REACT_APP_API_PATH_PREFIX || '').replace(/\/+$/, ''); // trim trailing slash

 const withBase = (path) => {
   const normalized = path.startsWith('/') ? path : `/${path}`;
   const prefix = API_PATH_PREFIX ? `/${API_PATH_PREFIX.replace(/^\/+/, '')}` : '';
   return `${API_BASE_URL}${prefix}${normalized}`;
 };

 // PUBLIC_INTERFACE
 export const endpoints = {
   // Auth
   auth: {
     // Using a prefix like '/api' (configurable) can help bypass ad-block rules targeting '/auth/*' on some setups
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
