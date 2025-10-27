import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB using Mongoose with robust options and retry logic.
 * - Validates MONGODB_URI presence
 * - Adds connection event logging
 * - Applies sensible timeouts and pool options
 * - Retries connecting with exponential backoff on startup
 */
// PUBLIC_INTERFACE
export async function connectDB(retries = 5) {
  mongoose.set('strictQuery', true);

  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  // Connection event logs
  mongoose.connection.on('connected', () => {
    console.log('[db] connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] error:', err?.message || err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  // Graceful shutdown
  const close = async () => {
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);

  const options = {
    autoIndex: true,
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    family: 4, // prefer IPv4 to reduce DNS issues in some envs
  };

  let attempt = 0;
  // Attempt initial connection with retries
  while (attempt <= retries) {
    try {
      await mongoose.connect(uri, options);
      return; // success
    } catch (err) {
      attempt += 1;
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 10000);
      console.error(`[db] connect attempt ${attempt} failed:`, err?.message || err);
      if (attempt > retries) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}
