import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { Metric } from '../models/Metric.js';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';

const router = Router();

/**
 * Validate and sanitize metrics filter parameters
 */
function validateMetricsFilters(query = {}) {
  const errors = [];
  const filters = {};

  // Limit parameter (default 20, max 100)
  const limit = parseInt(query.limit, 10);
  if (query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    errors.push('limit must be between 1 and 100');
  }
  filters.limit = Math.min(100, Math.max(1, limit || 20));

  // Time range filter (optional)
  if (query.startTime) {
    const startTime = new Date(query.startTime);
    if (isNaN(startTime.getTime())) {
      errors.push('startTime must be a valid ISO date string');
    } else {
      filters.startTime = startTime;
    }
  }

  if (query.endTime) {
    const endTime = new Date(query.endTime);
    if (isNaN(endTime.getTime())) {
      errors.push('endTime must be a valid ISO date string');
    } else {
      filters.endTime = endTime;
    }
  }

  // Metric type filter (optional)
  if (query.type) {
    const type = String(query.type).trim();
    if (type.length < 1 || type.length > 50) {
      errors.push('type must be between 1 and 50 characters');
    } else {
      filters.type = type;
    }
  }

  return { errors, filters };
}

/**
 * Validate activity filter parameters
 */
function validateActivityFilters(query = {}) {
  const errors = [];
  const filters = {};

  // Limit parameter
  const limit = parseInt(query.limit, 10);
  if (query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    errors.push('limit must be between 1 and 100');
  }
  filters.limit = Math.min(100, Math.max(1, limit || 30));

  // Action type filter
  if (query.action) {
    const validActions = ['login', 'logout', 'create_user', 'update_user', 'delete_user', 'metric_event', 'other'];
    const action = String(query.action).trim();
    if (!validActions.includes(action)) {
      errors.push(`action must be one of: ${validActions.join(', ')}`);
    } else {
      filters.action = action;
    }
  }

  // User email filter
  if (query.userEmail) {
    const email = String(query.userEmail).trim();
    if (email.length < 1 || email.length > 200) {
      errors.push('userEmail must be between 1 and 200 characters');
    } else {
      filters.userEmail = email;
    }
  }

  return { errors, filters };
}

/**
 * PUBLIC_INTERFACE
 * GET /metrics/stats
 * Summary: Returns aggregated metric stats with real-time MongoDB queries.
 * Description:
 *   Provides comprehensive metrics including user counts, activity rates,
 *   and recent metric entries for dashboard visualization.
 *   Uses efficient MongoDB aggregation with indexes.
 * Security: Requires a valid JWT (authRequired).
 * Query Parameters:
 *   - limit: number (default 20, max 100) - number of recent metrics to return
 *   - startTime: ISO date string (optional) - filter metrics after this time
 *   - endTime: ISO date string (optional) - filter metrics before this time
 *   - type: string (optional) - filter by metric type/key
 * Response:
 *   200: {
 *     count: number,           // number of recent metric points
 *     total: number,           // sum of metric values
 *     average: number,         // average metric value
 *     userCount: number,       // total active users
 *     totalUsers: number,      // all users
 *     activityRate: number,    // activities in last hour
 *     latest: Array<{ _id, key, value, createdAt, metadata }>
 *   }
 *   400: { error: { code, message } } - validation errors
 */
router.get('/stats', authRequired, async (req, res, next) => {
  try {
    // Validate input filters
    const { errors, filters } = validateMetricsFilters(req.query);
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: { 
          code: 'bad_request', 
          message: errors.join('; ') 
        } 
      });
    }

    // Build MongoDB query for metrics
    const metricQuery = {};
    if (filters.startTime || filters.endTime) {
      metricQuery.createdAt = {};
      if (filters.startTime) metricQuery.createdAt.$gte = filters.startTime;
      if (filters.endTime) metricQuery.createdAt.$lte = filters.endTime;
    }
    if (filters.type) {
      metricQuery.key = filters.type;
    }

    // Execute queries in parallel for efficiency
    const [latest, userCount, totalUsers, recentActivityCount] = await Promise.all([
      // Get recent metrics (uses index: { key: 1, createdAt: -1 })
      Metric.find(metricQuery)
        .sort({ createdAt: -1 })
        .limit(filters.limit)
        .select('key value createdAt metadata')
        .lean(),
      
      // Get active user count (uses index: { status: 1 })
      User.countDocuments({ status: 'active' }),
      
      // Get total user count
      User.countDocuments({}),
      
      // Get activity rate (activities in last hour) - uses index: { createdAt: -1 }
      Activity.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } 
      })
    ]);

    // Compute aggregates
    const total = latest.reduce((sum, m) => sum + (Number(m.value) || 0), 0);
    const average = latest.length > 0 ? total / latest.length : 0;

    res.json({
      count: latest.length,
      total: Math.round(total * 100) / 100,
      average: Math.round(average * 100) / 100,
      userCount,
      totalUsers,
      activityRate: recentActivityCount,
      latest: latest.map(m => ({
        id: m._id,
        key: m.key,
        value: m.value,
        createdAt: m.createdAt,
        metadata: m.metadata || {}
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUBLIC_INTERFACE
 * GET /metrics/activity
 * Summary: Returns recent activity feed for the dashboard.
 * Description:
 *   Lists recent user and system actions with efficient MongoDB queries.
 *   Supports filtering by action type and user email.
 *   Uses index on createdAt for optimal performance.
 * Security: Requires a valid JWT (authRequired).
 * Query Parameters:
 *   - limit: number (default 30, max 100) - number of activities to return
 *   - action: string (optional) - filter by action type
 *   - userEmail: string (optional) - filter by user email
 * Response:
 *   200: Array<{
 *     id: string,
 *     time: string,
 *     user: string,
 *     action: string,
 *     details: string
 *   }>
 *   400: { error: { code, message } } - validation errors
 */
router.get('/activity', authRequired, async (req, res, next) => {
  try {
    // Validate input filters
    const { errors, filters } = validateActivityFilters(req.query);
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: { 
          code: 'bad_request', 
          message: errors.join('; ') 
        } 
      });
    }

    // Build MongoDB query
    const activityQuery = {};
    if (filters.action) {
      activityQuery.action = filters.action;
    }
    if (filters.userEmail) {
      activityQuery.userEmail = filters.userEmail;
    }

    // Execute query with index: { createdAt: -1 }
    const activities = await Activity.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(filters.limit)
      .select('userEmail action details createdAt')
      .lean();

    res.json(
      activities.map((a) => ({
        id: String(a._id),
        time: a.createdAt,
        user: a.userEmail || 'system',
        action: a.action,
        details: a.details || ''
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
