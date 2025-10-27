import { env } from '../config/env.js';

/**
 * Express error handling middleware.
 * Ensures consistent JSON error responses and hides internals in production.
 */
export function errorHandler(err, req, res, next) {
  const isProd = (process.env.NODE_ENV || 'development') === 'production';

  const status = err.status || err.statusCode || 500;
  const code = err.code || 'server_error';
  const message = err.expose
    ? err.message
    : (isProd ? 'Internal Server Error' : err.message || 'Server error');

  // Basic structured log for server side visibility
  console.error('[error]', {
    status,
    code,
    message: err.message,
    stack: isProd ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}

export default errorHandler;
