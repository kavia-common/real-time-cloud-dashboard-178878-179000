import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSockets } from './sockets/index.js';
import { ensureDefaultAdmin } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import metricsRoutes from './routes/metrics.js';

/**
 * PUBLIC_INTERFACE
 * bootstrap()
 * Start Express + Socket.IO server after a successful MongoDB connection.
 * - Mirrors legacy routes under /api/*
 * - Enforces exact-origin CORS and robust preflight
 * - Adds concise request/response logging for auth endpoints
 * - Seeds default admin idempotently post-connect
 * - Emits clear startup logs for DB and route mounts
 */
async function bootstrap() {
  const app = express();

  // Security headers
  app.use(helmet());

  // Exact-origin CORS and robust preflight handling
  const allowedOrigin = env.CORS_ORIGIN;
  const corsConfig = {
    origin(origin, callback) {
      // Allow '*' (when enabled), exact origin match, or requests with no Origin (curl/health)
      if (allowedOrigin === '*' || !origin || origin === allowedOrigin) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
    optionsSuccessStatus: 204
  };
  app.use(cors(corsConfig));
  app.options('*', cors(corsConfig));

  // Body parser
  app.use(express.json({ limit: '1mb', strict: true }));

  // Access log
  app.use(morgan('dev'));

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 200,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many requests' }
    })
  );

  // Health endpoints (legacy + /api)
  app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // Lightweight debug info for preview/diagnostics
  // PUBLIC_INTERFACE
  app.get('/api/debug/info', (req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      server: {
        port: env.PORT,
        corsOrigin: allowedOrigin,
        socketPath: env.SOCKET_PATH,
      },
      process: {
        node: process.version,
        env: process.env.NODE_ENV || 'development',
      },
      routes: ['/health', '/api/health', '/api/echo', '/auth/*', '/api/auth/*', '/users/*', '/api/users/*', '/metrics/*', '/api/metrics/*'],
    });
  });

  // Simple echo for network/CORS diagnostics (legacy under auth router, and top-level /api/echo)
  app.get('/api/echo', (req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      origin: req.headers.origin || null,
      path: req.originalUrl
    });
  });

  // Lightweight audit logger for auth endpoints
  const authAudit = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log('[auth_audit]', method, originalUrl, '->', res.statusCode, `${ms}ms`);
    });
    next();
  };

  // Route mounts
  app.use('/auth', authAudit, authRoutes);
  app.use('/users', usersRoutes);
  app.use('/metrics', metricsRoutes);

  // Duplicate under /api
  app.use('/api/auth', authAudit, authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/metrics', metricsRoutes);

  console.log('[startup] Routes mounted: /health, /auth, /users, /metrics and /api/* mirrors');

  // Not found handler (JSON)
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') return next();
    return res.status(404).json({ error: 'Not Found' });
  });

  // Error handler
  // PUBLIC_INTERFACE
  app.use((err, req, res, next) => {
    const path = `${req.method} ${req.originalUrl}`;
    console.error('[error]', path, err?.message || err);
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    return res.status(status).json({ error: status === 500 ? 'Server error' : err.message || 'Error' });
  });

  // Create HTTP server + Socket.IO with aligned CORS/origin
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    path: env.SOCKET_PATH,
    cors: { origin: allowedOrigin, methods: ['GET', 'POST'] }
  });
  initSockets(io);

  // Connect DB first
  console.log('[startup] Connecting to MongoDB ...');
  await connectDB();

  // Sync indexes (non-fatal)
  try {
    const { User } = await import('./models/User.js');
    const { Activity } = await import('./models/Activity.js');
    const { Metric } = await import('./models/Metric.js');
    await Promise.all([User.syncIndexes(), Activity.syncIndexes(), Metric.syncIndexes()]);
    console.log('[db] index sync completed');
  } catch (e) {
    console.warn('[db] index sync warning:', e?.message || e);
  }

  // Ensure default admin idempotently
  await ensureDefaultAdmin();

  // Configure timeouts
  server.headersTimeout = 65_000;
  server.requestTimeout = 60_000;
  server.keepAliveTimeout = 20_000;

  // Start listening after successful DB and seeding
  server.listen(env.PORT, () => {
    console.log(`[startup] Server listening on http://localhost:${env.PORT}`);
    console.log(`[startup] CORS origin allowed: ${allowedOrigin}`);
    console.log(`[startup] Socket.IO path: ${env.SOCKET_PATH}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
