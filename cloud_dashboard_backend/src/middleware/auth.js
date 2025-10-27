import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

/**
 * Utility to build consistent error payloads.
 */
function errorPayload(code, message) {
  return { error: { code, message } };
}

/**
 * Extract bearer token from Authorization header.
 */
function getTokenFromHeader(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth || typeof auth !== 'string') return null;
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

// PUBLIC_INTERFACE
export async function ensureDefaultAdmin() {
  /** No-op: seeding handled during DB connect. Kept for backward compatibility. */
  return;
}

/**
 * Sign a JWT for a given user document/lean object.
 * Token contains minimal identity info for stateless auth checks.
 */
// PUBLIC_INTERFACE
export function signUserToken(user, opts = {}) {
  /**
   * Issue a JWT for the provided user.
   * Payload:
   *  - sub: user id
   *  - email: user email
   *  - role: user role
   *  - iat/exp: issued-at and expiration
   */
  const payload = {
    sub: String(user._id || user.id),
    email: user.email,
    role: user.role || 'user'
  };
  const options = {
    expiresIn: opts.expiresIn || '12h'
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Middleware to require authentication via Bearer token.
 * Attaches req.user = { id, email, role } on success.
 */
// PUBLIC_INTERFACE
export async function authRequired(req, res, next) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json(errorPayload('unauthorized', 'Missing or invalid Authorization header'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json(errorPayload('invalid_token', 'Invalid or expired token'));
    }

    // Basic shape
    const identity = { id: decoded.sub, email: decoded.email, role: decoded.role };
    // Optionally ensure user still exists and is active
    const user = await User.findById(identity.id).select('email role status').lean();
    if (!user || user.status === 'disabled') {
      return res.status(401).json(errorPayload('unauthorized', 'User not authorized'));
    }

    req.user = { id: String(identity.id), email: user.email, role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware factory to require a specific role (e.g., 'admin').
 * Use after authRequired.
 */
// PUBLIC_INTERFACE
export function requireRole(role) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json(errorPayload('unauthorized', 'Authentication required'));
    }
    if (req.user.role !== role) {
      return res.status(403).json(errorPayload('forbidden', 'Insufficient permissions'));
    }
    return next();
  };
}

export default {
  ensureDefaultAdmin,
  signUserToken,
  authRequired,
  requireRole
};
