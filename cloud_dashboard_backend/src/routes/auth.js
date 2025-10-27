import { Router } from 'express';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { authRequired, signUserToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /auth/register
 * summary: Register a new user
 * description: Creates a new user account, hashes password with bcrypt, issues JWT.
 * requestBody: { name: string, email: string, password: string }
 * responses:
 *  - 201: { token: string, user: { id, name, email, role } }
 *  - 400: { error: { code, message } }
 *  - 409: { error: { code, message } }
 *  - 500: { error: { code, message } }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Missing required fields' } });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: { code: 'conflict', message: 'Email already in use' } });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: 'user', status: 'active' });

    const activity = await Activity.create({
      userId: user._id,
      userEmail: user.email,
      action: 'login', // recorded as general activity type
      details: `User ${email} registered`
    });

    // Emit real-time activity event to Socket.IO clients
    if (typeof global.emitActivityEvent === 'function') {
      global.emitActivityEvent(activity);
    }

    const token = signUserToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[auth.register] error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Internal Server Error' } });
  }
});

/**
 * POST /auth/login
 * summary: Login user
 * description: Authenticates with email and password, returns JWT and user profile.
 * requestBody: { email: string, password: string }
 * responses:
 *  - 200: { token: string, user: { id, name, email, role } }
 *  - 400: { error: { code, message } }
 *  - 401: { error: { code, message } }
 *  - 500: { error: { code, message } }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { code: 'bad_request', message: 'Missing email or password' } });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid credentials' } });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid credentials' } });
    }

    const token = signUserToken(user);

    const activity = await Activity.create({
      userId: user._id,
      userEmail: user.email,
      action: 'login',
      details: 'User logged in'
    });

    // Emit real-time activity event to Socket.IO clients
    if (typeof global.emitActivityEvent === 'function') {
      global.emitActivityEvent(activity);
    }

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[auth.login] error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Internal Server Error' } });
  }
});

/**
 * GET /auth/me
 * summary: Current authenticated user
 * description: Returns the user profile for the provided Bearer token.
 * security: BearerAuth
 * responses:
 *  - 200: { id, name, email, role, status, createdAt, updatedAt }
 *  - 401: { error: { code, message } }
 *  - 404: { error: { code, message } }
 *  - 500: { error: { code, message } }
 */
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ error: { code: 'not_found', message: 'User not found' } });
    }
    const { _id, name, email, role, status, createdAt, updatedAt } = user;
    return res.json({ id: _id, name, email, role, status, createdAt, updatedAt });
  } catch (err) {
    console.error('[auth.me] error', err);
    return res.status(500).json({ error: { code: 'server_error', message: 'Internal Server Error' } });
  }
});

export default router;
