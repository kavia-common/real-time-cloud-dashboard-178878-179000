import { Router } from 'express';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

/**
 * GET /users
 * List users (admin only).
 */
router.get('/', authRequired, requireAdmin, async (req, res) => {
  const users = await User.find().select('name email role status createdAt').lean();
  res.json(users.map(u => ({ id: u._id, ...u })));
});

/**
 * POST /users
 * Create a user (admin only).
 */
router.post('/', authRequired, requireAdmin, async (req, res) => {
  const { name, email, password = 'changeme', role = 'user', status = 'active' } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Missing fields' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, status });

  await Activity.create({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'user.create',
    details: `Created user ${email}`
  });

  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status });
});

/**
 * GET /users/:id
 * Get user detail (admin or self).
 */
router.get('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });
  const u = await User.findById(id).select('name email role status createdAt updatedAt').lean();
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ id: u._id, ...u });
});

/**
 * PUT /users/:id
 * Update user (admin or self with restrictions).
 */
router.put('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });

  const toSet = {};
  if (body.name) toSet.name = body.name;
  if (req.user.role === 'admin') {
    if (body.role) toSet.role = body.role;
    if (body.status) toSet.status = body.status;
  }
  const updated = await User.findByIdAndUpdate(id, { $set: toSet }, { new: true }).select('name email role status').lean();
  if (!updated) return res.status(404).json({ error: 'Not found' });

  await Activity.create({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'user.update',
    details: `Updated user ${updated.email}`
  });

  res.json({ id: updated._id, ...updated });
});

/**
 * DELETE /users/:id
 * Delete user (admin only).
 */
router.delete('/:id', authRequired, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id).lean();
  if (!deleted) return res.status(404).json({ error: 'Not found' });

  await Activity.create({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'user.delete',
    details: `Deleted user ${deleted.email}`
  });

  res.json({ success: true });
});

export default router;
