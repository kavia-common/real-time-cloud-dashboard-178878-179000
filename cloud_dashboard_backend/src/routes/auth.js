import { Router } from 'express';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { authRequired, signUserToken } from '../middleware/auth.js';

const router = Router();

/**
 * GET /auth/echo
 * Simple diagnostic endpoint to test connectivity/CORS without auth.
 * Returns origin header, time and path.
 */
router.get('/echo', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    origin: req.headers.origin || null,
    path: req.originalUrl,
  });
});

/**
 * POST /auth/register
 * Registers a new user. Admin presence required in real app; for skeleton we allow public.
 */
router.post('/register', async (req, res) => {
  try {
    // Guard against invalid JSON
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type. Expected application/json' });
    }
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ error: 'Invalid email' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password too short' });

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await User.hashPassword(String(password));
    const user = await User.create({ name: String(name).trim(), email: String(email).toLowerCase().trim(), passwordHash, role: 'user', status: 'active' });

    await Activity.create({
      userId: user._id,
      userEmail: user.email,
      action: 'user.register',
      details: `User ${user.email} registered`
    });

    const token = signUserToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    // Add robust logging context for debugging failures
    console.error('[auth.register] error', err?.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /auth/login
 * Login with email/password.
 */
router.post('/login', async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type. Expected application/json' });
    }
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      console.warn('[auth.login] invalid email', normalizedEmail);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await user.comparePassword(String(password));
    if (!ok) {
      console.warn('[auth.login] wrong password for', normalizedEmail);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signUserToken(user);

    await Activity.create({
      userId: user._id,
      userEmail: user.email,
      action: 'user.login',
      details: 'User logged in'
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[auth.login] error', err?.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /auth/me
 * Returns current user info from token.
 */
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: 'Not found' });
    const { _id, name, email, role, status, createdAt, updatedAt } = user;
    res.json({ id: _id, name, email, role, status, createdAt, updatedAt });
  } catch (err) {
    console.error('[auth.me] error', err?.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /auth/logout
 * Stateless logout endpoint for frontend symmetry; no server state to clear.
 */
router.post('/logout', authRequired, async (req, res) => {
  try {
    await Activity.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'user.logout',
      details: 'User logged out'
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[auth.logout] error', err?.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
