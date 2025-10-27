import { Router } from 'express';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { authRequired, signUserToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /auth/register
 * Registers a new user. Admin presence required in real app; for skeleton we allow public.
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role: 'user', status: 'active' });

    await Activity.create({
      userId: user._id,
      userEmail: user.email,
      action: 'user.register',
      details: `User ${email} registered`
    });

    const token = signUserToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[auth.register] error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /auth/login
 * Login with email/password.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signUserToken(user);

    await Activity.create({
      userId: user._id,
      userEmail: user.email,
      action: 'user.login',
      details: 'User logged in'
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[auth.login] error', err);
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
    console.error('[auth.me] error', err);
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
    console.error('[auth.logout] error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
