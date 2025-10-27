import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './env.js';
import { User } from '../models/User.js';

/**
 * Robust MongoDB connection with retries and default admin seeding.
 * - Reads MONGODB_URI from env
 * - Retries connection with exponential backoff
 * - Logs success/failure details
 * - Exits process in dev on unrecoverable failure
 * - Idempotently seeds a default admin based on env vars
 */

let isConnected = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt to connect with limited retries and exponential backoff.
 */
async function connectWithRetry(uri, maxRetries = 5, baseDelayMs = 1000) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(uri, {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 60000,
        family: 4
      });
      console.log(`[db] connected (attempt ${attempt + 1})`);
      return;
    } catch (err) {
      attempt += 1;
      const isLast = attempt > maxRetries;
      console.error(`[db] connection attempt ${attempt} failed: ${err.message}`);
      if (isLast) throw err;
      const delay = Math.min(15000, baseDelayMs * Math.pow(2, attempt - 1));
      console.log(`[db] retrying in ${delay}ms...`);
      await wait(delay);
    }
  }
}

/**
 * Idempotently seed default admin user based on env vars.
 * Uses password hashing if necessary.
 */
async function seedDefaultAdmin() {
  const email = env.DEFAULT_ADMIN_EMAIL;
  const name = env.DEFAULT_ADMIN_NAME || 'Administrator';
  const password = env.DEFAULT_ADMIN_PASSWORD;
  // Allow multiple env naming variations for role
  const role =
    env.DEFAULT_ADMIN_ROLE ||
    env.DEFAULT_ADMIN_ROLE_NAME ||
    env.DEFAULT_ADMIN ||
    'admin';

  if (!email || !password) {
    console.log('[seed] DEFAULT_ADMIN_EMAIL and/or DEFAULT_ADMIN_PASSWORD not set; skipping admin seeding');
    return;
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    console.log('[seed] default admin already exists');
    return;
  }

  // If our User model expects passwordHash (current schema), ensure hashing here
  let passwordHash;
  try {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  } catch (e) {
    console.error('[seed] failed to hash default admin password:', e.message);
    throw e;
  }

  await User.create({
    name,
    email,
    passwordHash,
    role,
    status: 'active'
  });

  console.log(`[seed] default admin created: ${email}`);
}

// PUBLIC_INTERFACE
export async function connectDB() {
  /**
   * Connect to MongoDB with retries and seed default admin if provided by env.
   * Returns when a connection is established; throws on unrecoverable failure.
   */
  if (isConnected) return;

  mongoose.set('strictQuery', true);

  const uri = env.MONGODB_URI;
  if (!uri) {
    const msg = 'MONGODB_URI is not set';
    console.error('[db] ' + msg);
    throw new Error(msg);
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('[db] connected (event)');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[db] disconnected');
  });

  try {
    await connectWithRetry(uri);

    // After connection, seed default admin (idempotent)
    try {
      await seedDefaultAdmin();
    } catch (seedErr) {
      console.error('[seed] default admin seeding failed:', seedErr.message);
    }
  } catch (err) {
    console.error('[db] unrecoverable connection failure:', err.message);
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv !== 'production') {
      console.error('[db] exiting process due to unrecoverable failure (dev mode)');
      process.exit(1);
    } else {
      throw err;
    }
  }
}
