import { Router } from 'express';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

/**
 * Helper: admin guard.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
  }
  return next();
}

/**
 * Validate pagination/sorting query parameters with sane defaults.
 */
function parseListParams(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const sortBy = String(query.sortBy || 'createdAt');
  const allowedSort = new Set(['name', 'email', 'role', 'status', 'createdAt', 'updatedAt']);
  const sortField = allowedSort.has(sortBy) ? sortBy : 'createdAt';
  const sortOrder = (String(query.sortOrder || 'desc').toLowerCase() === 'asc') ? 1 : -1;
  const search = String(query.search || '').trim();
  return { page, limit, sort: { [sortField]: sortOrder }, search };
}

/**
 * Build a Mongo filter from search string.
 * Supports case-insensitive match on name or email.
 */
function buildSearchFilter(search) {
  if (!search) return {};
  const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: [{ name: rx }, { email: rx }] };
}

/**
 * GET /users
 * summary: List users (admin only)
 * description: Returns paginated list of users with optional text search and sorting.
 * query:
 *  - page: number (default 1)
 *  - limit: number (default 20, max 100)
 *  - sortBy: one of [name,email,role,status,createdAt,updatedAt] (default createdAt)
 *  - sortOrder: asc|desc (default desc)
 *  - search: string (matches name/email)
 * responses:
 *  - 200: { data:[{id,name,email,role,status,createdAt,updatedAt}], page, limit, total, totalPages, sortBy, sortOrder, search }
 */
router.get('/', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, sort, search } = parseListParams(req.query);
    const filter = buildSearchFilter(search);

    const [data, total] = await Promise.all([
      User.find(filter)
        .select('name email role status createdAt updatedAt')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const payload = {
      data: data.map((u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, status: u.status, createdAt: u.createdAt, updatedAt: u.updatedAt })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      sortBy: Object.keys(sort)[0],
      sortOrder: sort[Object.keys(sort)[0]] === 1 ? 'asc' : 'desc',
      search
    };
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
});

/**
 * Basic input validation for create/update user body.
 */
function validateUserInput(body, { isCreate = false, isAdmin = false } = {}) {
  const errors = [];
  const out = {};

  if (isCreate) {
    if (!body?.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push('Name is required and must be at least 2 characters');
    } else {
      out.name = body.name.trim();
    }
    if (!body?.email || typeof body.email !== 'string') {
      errors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(body.email)) {
      errors.push('Email must be valid');
    } else {
      out.email = String(body.email).toLowerCase().trim();
    }
    if (!body?.password || typeof body.password !== 'string' || body.password.length < 6) {
      // Default password allowed on create via admin, but if provided must be >=6
      if (body.password) errors.push('Password must be at least 6 characters');
    } else {
      out.password = body.password;
    }
  } else {
    if (body?.name) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2) errors.push('Name must be at least 2 characters');
      else out.name = body.name.trim();
    }
    if (isAdmin) {
      if (body?.role) {
        if (!['admin', 'user'].includes(body.role)) errors.push('Invalid role');
        else out.role = body.role;
      }
      if (body?.status) {
        if (!['active', 'invited', 'disabled'].includes(body.status)) errors.push('Invalid status');
        else out.status = body.status;
      }
    }
    if (body?.password) {
      if (typeof body.password !== 'string' || body.password.length < 6) errors.push('Password must be at least 6 characters');
      else out.password = body.password;
    }
  }

  return { errors, out };
}

/**
 * POST /users
 * summary: Create a new user (admin only)
 * description: Admins can create users with role and status. If password omitted, a default 'changeme' is used and should be updated later.
 * requestBody: { name, email, password?, role?, status? }
 * responses:
 *  - 201: { id,name,email,role,status,createdAt,updatedAt }
 *  - 400|409 errors
 */
router.post('/', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const { errors, out } = validateUserInput(req.body, { isCreate: true, isAdmin: true });
    if (errors.length) return res.status(400).json({ error: { code: 'bad_request', message: errors.join('; ') } });

    const exists = await User.findOne({ email: out.email });
    if (exists) return res.status(409).json({ error: { code: 'conflict', message: 'Email already in use' } });

    const password = out.password || 'changeme';
    const passwordHash = await User.hashPassword(password);
    const payload = {
      name: out.name,
      email: out.email,
      passwordHash,
      role: ['admin', 'user'].includes(req.body?.role) ? req.body.role : 'user',
      status: ['active', 'invited', 'disabled'].includes(req.body?.status) ? req.body.status : 'active'
    };

    const user = await User.create(payload);

    const activity = await Activity.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'create_user',
      details: `Created user ${user.email}`,
      ip: req.ip
    });

    // Emit real-time activity event to Socket.IO clients
    if (typeof global.emitActivityEvent === 'function') {
      global.emitActivityEvent(activity);
    }

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:id
 * summary: Get a user by id (admin or self)
 */
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    }
    const u = await User.findById(id).select('name email role status createdAt updatedAt').lean();
    if (!u) return res.status(404).json({ error: { code: 'not_found', message: 'User not found' } });
    return res.json({ id: u._id, name: u.name, email: u.email, role: u.role, status: u.status, createdAt: u.createdAt, updatedAt: u.updatedAt });
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /users/:id
 * summary: Update a user (admin or self with restricted fields)
 * description: Non-admins may update only their own 'name' or password. Admins may also update role and status.
 */
router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: { code: 'forbidden', message: 'Insufficient permissions' } });
    }

    const { errors, out } = validateUserInput(req.body, { isCreate: false, isAdmin });
    if (errors.length) return res.status(400).json({ error: { code: 'bad_request', message: errors.join('; ') } });

    const update = {};
    if (out.name) update.name = out.name;
    if (isAdmin && out.role) update.role = out.role;
    if (isAdmin && out.status) update.status = out.status;

    if (out.password) {
      update.passwordHash = await User.hashPassword(out.password);
    }

    const updated = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
      .select('name email role status createdAt updatedAt')
      .lean();
    if (!updated) return res.status(404).json({ error: { code: 'not_found', message: 'User not found' } });

    const activity = await Activity.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'update_user',
      details: `Updated user ${updated.email}`,
      ip: req.ip
    });

    // Emit real-time activity event to Socket.IO clients
    if (typeof global.emitActivityEvent === 'function') {
      global.emitActivityEvent(activity);
    }

    return res.json({ id: updated._id, name: updated.name, email: updated.email, role: updated.role, status: updated.status, createdAt: updated.createdAt, updatedAt: updated.updatedAt });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /users/:id
 * summary: Delete a user (admin only)
 */
router.delete('/:id', authRequired, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ error: { code: 'not_found', message: 'User not found' } });

    const activity = await Activity.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'delete_user',
      details: `Deleted user ${deleted.email}`,
      ip: req.ip
    });

    // Emit real-time activity event to Socket.IO clients
    if (typeof global.emitActivityEvent === 'function') {
      global.emitActivityEvent(activity);
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
