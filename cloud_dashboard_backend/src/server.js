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
 *  - GET /health               Health check
 *  - /auth (POST /login, POST /register, GET /me, POST /logout)
 *  - /users (CRUD, admin restricted)
 *  - /metrics (GET /stats, GET /activity)
 */
async function bootstrap() {
  const app = express();

  // Security and utilities
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 200,
      standardHeaders: 'draft-7',
      legacyHeaders: false
    })
  );

  // Health route
  // Returns a basic readiness payload: { status: "ok", time: ISOString }
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount API routes
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);
  app.use('/metrics', metricsRoutes);

  // 404 handler for unknown API routes
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') return next();
    return res.status(404).json({ error: 'Not Found' });
  });

  // Centralized error handler
  // Ensures consistent 500 response structure and hides stack in production
  // PUBLIC_INTERFACE
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error('[error]', err?.message || err);
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
    cors: { origin: env.CORS_ORIGIN, methods: ['GET', 'POST'] }
  });
  initSockets(io);

  // Database connect and default admin
  await connectDB();
  await ensureDefaultAdmin();

  server.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
