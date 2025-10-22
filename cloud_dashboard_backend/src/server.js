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
 *  - /auth (POST /login, POST /register, GET /me)
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
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount API routes
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);
  app.use('/metrics', metricsRoutes);

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
