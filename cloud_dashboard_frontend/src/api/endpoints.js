 /**
  * API endpoints mapping to backend routes.
  * Ensure REACT_APP_API_BASE_URL in .env points to backend (e.g., http://localhost:4000).
  * REACT_APP_API_PATH_PREFIX defaults to '/api' to avoid adblock heuristics (configurable to '').
  * Also supports PATH_PREFIX for deployments under a subpath (served path) - used for diagnostics only.
  */

 // PUBLIC_INTERFACE
 export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
 // PUBLIC_INTERFACE
 export const API_PATH_PREFIX = (process.env.REACT_APP_API_PATH_PREFIX ?? '/api').replace(/\/*$/, ''); // trim trailing slash
 // PUBLIC_INTERFACE
 export const PATH_PREFIX = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

 // Diagnostic logging when envs are missing/misconfigured
 (() => {
   const missing = [];
   if (!process.env.REACT_APP_API_BASE_URL) missing.push('REACT_APP_API_BASE_URL');
   if (typeof process.env.REACT_APP_API_PATH_PREFIX === 'undefined') {
     // default kicks in, but note it for transparency
     // eslint-disable-next-line no-console
     console.info('[Config] REACT_APP_API_PATH_PREFIX not set; defaulting to "/api".');
   }
   if (missing.length) {
     // eslint-disable-next-line no-console
     console.warn(
       `[Config] Missing env vars: ${missing.join(', ')}. Using defaults. ` +
         'If the frontend cannot reach the backend, set REACT_APP_API_BASE_URL and REACT_APP_API_PATH_PREFIX=/api.'
     );
   }
   if (PATH_PREFIX) {
     // eslint-disable-next-line no-console
     console.info(`[Config] App served under subpath: ${PATH_PREFIX}`);
   }
 })();

 const withBase = (path) => {
   // PUBLIC_INTERFACE
   /** Build a fully-qualified endpoint URL using baseURL + optional path prefix. */
   const normalized = path.startsWith('/') ? path : `/${path}`;
   const prefix = API_PATH_PREFIX ? `/${API_PATH_PREFIX.replace(/^\/*/, '')}` : '';
   return `${API_BASE_URL}${prefix}${normalized}`;
 };

 // PUBLIC_INTERFACE
 export const endpoints = {
   // Health and echo utilities
   util: {
     health: withBase('/health'),
     ping: withBase('/ping'),
     echo: withBase('/auth/echo'),
   },

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
