import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration with defaults and basic validation.
 * Note: All secrets should be set via .env in deployment.
 */

// PUBLIC_INTERFACE
export const env = {
  PORT: Number(process.env.PORT || 4000),
  // MONGODB_URI must be explicitly provided; no default fallback to avoid accidental local misconfig
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  SOCKET_PATH: process.env.SOCKET_PATH || '/socket.io',
  METRIC_TICK_MS: Number(process.env.METRIC_TICK_MS || 3000),

  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD
};

/**
 * Validate critical env vars; throws if configuration is unsafe in production.
 */
// PUBLIC_INTERFACE
export function validateEnv() {
  const problems = [];

  if (!env.MONGODB_URI) problems.push('MONGODB_URI is required');
  if (!env.JWT_SECRET || env.JWT_SECRET === 'change-me-in-production') {
    const isProd = (process.env.NODE_ENV || 'development') === 'production';
    if (isProd) problems.push('JWT_SECRET must be set to a strong secret in production');
  }
  if (!env.CORS_ORIGIN) problems.push('CORS_ORIGIN should be set to your frontend origin');

  if (!String(env.SOCKET_PATH).startsWith('/')) {
    problems.push('SOCKET_PATH must start with "/"');
  }

  if (env.METRIC_TICK_MS < 250) {
    problems.push('METRIC_TICK_MS too low; must be >= 250');
  }

  // Admin bootstrap: only warn in dev if partially configured
  const hasAnyAdmin = Boolean(env.DEFAULT_ADMIN_EMAIL || env.DEFAULT_ADMIN_PASSWORD || env.DEFAULT_ADMIN_NAME);
  if (hasAnyAdmin) {
    if (!env.DEFAULT_ADMIN_EMAIL) problems.push('DEFAULT_ADMIN_EMAIL is set partially; provide email for bootstrap');
    if (!env.DEFAULT_ADMIN_PASSWORD) problems.push('DEFAULT_ADMIN_PASSWORD is required to bootstrap default admin');
  }

  if (problems.length) {
    const message = 'Environment validation failed:\n - ' + problems.join('\n - ');
    throw new Error(message);
  }
}
