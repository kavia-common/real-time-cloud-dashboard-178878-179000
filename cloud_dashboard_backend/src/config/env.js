import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration with defaults.
 * Note: All secrets should be set via .env in deployment.
 */
export const env = {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cloud_dashboard',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production',
  // CORS origin: in production must be set explicitly; otherwise default to '*' for preview/dev safety
  CORS_ORIGIN: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || 'http://localhost:3000')
    : (process.env.CORS_ORIGIN || '*'),
  SOCKET_PATH: process.env.SOCKET_PATH || '/socket.io',
  METRIC_TICK_MS: Number(process.env.METRIC_TICK_MS || 3000),

  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Administrator',
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
};
