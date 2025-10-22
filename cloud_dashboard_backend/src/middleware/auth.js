import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

// PUBLIC_INTERFACE
export function authRequired(req, res, next) {
  /** Express middleware to validate Bearer JWT and attach req.user. */
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// PUBLIC_INTERFACE
export function signUserToken(user) {
  /** Create JWT for a user payload. */
  const payload = { id: user._id, email: user.email, role: user.role, name: user.name };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

// PUBLIC_INTERFACE
export async function ensureDefaultAdmin() {
  /** Ensure a default admin user exists based on environment defaults. */
  const existing = await User.findOne({ email: env.DEFAULT_ADMIN_EMAIL }).select('_id');
  if (existing) return;

  const passwordHash = await User.hashPassword(env.DEFAULT_ADMIN_PASSWORD);
  await User.create({
    name: env.DEFAULT_ADMIN_NAME,
    email: env.DEFAULT_ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
    status: 'active'
  });
  console.log(`[auth] Default admin ensured: ${env.DEFAULT_ADMIN_EMAIL}`);
}
