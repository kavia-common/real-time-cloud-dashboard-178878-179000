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
 * Creates and starts the HTTP server with Express and Socket.IO.
 * Routes:
 *  - GET /health and /api/health           Health check
 *  - /auth and /api/auth                   (POST /login, POST /register, GET /me, POST /logout, GET /echo)
 *  - /users and /api/users                 (CRUD, admin restricted)
 *  - /metrics and /api/metrics             (GET /stats, GET /activity)
 * Notes:
 *  - Keeps legacy non-/api paths for backward compatibility
 *  - Adds robust CORS with exact origin and credentials disabled
 *  - Adds request/response logging for auth endpoints (minimal info)
 *  - Ensures server listens only after successful DB connect
 *  - Sets sane server timeouts
 */
async function bootstrap() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS: exact origin; credentials disabled to simplify preflight and avoid cookie issues
  const allowedOrigin = env.CORS_ORIGIN;
  const corsConfig = {
    origin: function (origin, callback) {
      // Allow same-origin or exact configured origin; also allow no Origin for curl/health
      if (!origin || origin === allowedOrigin) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
    optionsSuccessStatus: 204
  };
  app.use(cors(corsConfig));
  // Preflight for all routes
  app.options('*', cors(corsConfig));

  // JSON parser
  app.use(express.json({ limit: '1mb', strict: true }));

  // Access logging (dev concise)
  app.use(morgan('dev'));

  // Rate limiter
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 200,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many requests' }
    })
  );

  // Health routes (legacy and /api)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Lightweight request/response logging for auth endpoints
  const authAudit = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    // Minimal identifying info; never log credentials/body
    res.on('finish', () => {
      const ms = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log('[auth_audit]', method, originalUrl, '->', res.statusCode, `${ms}ms`);
    });
    next();
  };

  // Echo under /api to diagnose adblock/CORS quickly
  app.get('/api/echo', (req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      origin: req.headers.origin || null,
      path: req.originalUrl
    });
  });

  // Mount API routes (legacy)
  app.use('/auth', authAudit, authRoutes);
  app.use('/users', usersRoutes);
  app.use('/metrics', metricsRoutes);

  // Mount duplicate API routes under /api/*
  app.use('/api/auth', authAudit, authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/metrics', metricsRoutes);

  // 404 handler for unknown API routes
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') return next();
    return res.status(404).json({ error: 'Not Found' });
  });

  // Centralized error handler
  // Ensures consistent 500 response structure and hides stack in production
  // PUBLIC_INTERFACE
  app.use((err, req, res, next) => {
    const path = `${req.method} ${req.originalUrl}`;
    // eslint-disable-next-line no-console
    console.error('[error]', path, err?.message || err);
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    const payload = {
      error: status === 500 ? 'Server error' : err.message || 'Error',
    };
    return res.status(status).json(payload);
  });

  // Create server and attach Socket.IO
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    path: env.SOCKET_PATH,
    cors: { origin: allowedOrigin, methods: ['GET', 'POST'] }
  });
  initSockets(io);

  // Database connect and default admin
  await connectDB();

  // Quick DB/index self-check (non-fatal): validates models/indexes are usable
  try {
    const { User } = await import('./models/User.js');
    const { Activity } = await import('./models/Activity.js');
    const { Metric } = await import('./models/Metric.js');
    await Promise.all([User.syncIndexes(), Activity.syncIndexes(), Metric.syncIndexes()]);
    console.log('[db] index sync completed');
  } catch (e) {
    console.warn('[db] index sync warning:', e?.message || e);
  }

  // Idempotent admin seeding after successful DB connection
  await ensureDefaultAdmin();

  // Sane timeouts
  server.headersTimeout = 65_000;   // Node default 60s; bump slightly
  server.requestTimeout = 60_000;   // Time to receive entire request
  server.keepAliveTimeout = 20_000; // Keep-alive to balance proxies

  // Start listening only after successful DB connect and seeding
  server.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
