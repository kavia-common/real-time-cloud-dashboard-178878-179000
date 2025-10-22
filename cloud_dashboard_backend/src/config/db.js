import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connect to MongoDB using Mongoose with basic event logging.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  mongoose.connection.on('connected', () => {
    console.log('[db] connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  await mongoose.connect(uri, {
    autoIndex: true
  });
}
