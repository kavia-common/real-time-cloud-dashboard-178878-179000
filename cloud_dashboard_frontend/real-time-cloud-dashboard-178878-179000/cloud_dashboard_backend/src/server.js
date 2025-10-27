import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';

import { env, validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { ensureDefaultAdmin } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import metricsRoutes from './routes/metrics.js';

/**
 * PUBLIC_INTERFACE
 * bootstrap
 * Creates and starts the HTTP server with Express and Socket.IO.
 * Routes:
 *  - GET /healthz          Liveness probe
 *  - GET /readyz           Readiness probe
 *  - /auth                 Auth endpoints
 *  - /users                Users CRUD (admin)
 *  - /metrics              Metrics/Activity
 *
 * Socket.IO:
 *  - Path configurable via env.SOCKET_PATH; CORS set from env.CORS_ORIGIN
 *  - initSockets sets up ticker and cleanup handlers.
 */
async function bootstrap() {
  validateEnv();

  const app = express();

  // Security headers with CSP tuned for API and sockets
  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'blob:'],
    connectSrc: ["'self'", env.CORS_ORIGIN, env.API_BASE_URL ?? env.CORS_ORIGIN, env.SOCKET_URL ?? env.CORS_ORIGIN, 'ws:', 'wss:'].filter(Boolean),
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null
  };
  app.use(helmet({
    contentSecurityPolicy: env.DISABLE_CSP === 'true' ? false : { useDefaults: true, directives: cspDirectives },
    crossOriginEmbedderPolicy: false
  }));
  app.disable('x-powered-by');

  // Logging
  app.use(morgan(process.env.MORGAN_FORMAT || 'combined'));

  // CORS
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Rate limiting for API
  app.use('/api', rateLimit({
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(env.RATE_LIMIT_MAX || 1000),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: { code: 'rate_limited', message: 'Too many requests, please try again later.' } }
  }));

  // Body parser
  app.use(express.json({ limit: '1mb' }));

  // PUBLIC_INTERFACE
  app.get('/healthz', (req, res) => {
    /** Liveness probe; returns OK if process is responding. */
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // PUBLIC_INTERFACE
  app.get('/readyz', async (req, res) => {
    /** Readiness probe; basic readiness; database connection established by connectDB below. */
    try {
      // If DB connection failed, bootstrap would have exited
      res.status(200).json({ status: 'ready' });
    } catch (_e) {
      res.status(503).json({ status: 'not-ready' });
    }
  });

  // Mount API routes with /api prefix (match compose expectations)
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/metrics', metricsRoutes);

  // 404 for unmatched routes under API
  app.use('/api', (req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
  });

  // Error handler
  app.use(errorHandler);

  // Create server and attach Socket.IO with env-based path and CORS
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    path: env.SOCKET_PATH || '/socket.io',
    cors: { origin: env.CORS_ORIGIN, methods: ['GET', 'POST'], credentials: true }
  });
  initSockets(io);

  // Database connect and default admin
  await connectDB();
  await ensureDefaultAdmin();

  const port = env.PORT || 5000;
  const httpServer = server.listen(port, () => {
    console.log(`Server running on port ${port} (socket path: ${env.SOCKET_PATH || '/socket.io'})`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`${signal} received: closing server...`);
    httpServer.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Force shutting down.');
      process.exit(1);
    }, 10000);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
