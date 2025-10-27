import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { Metric } from '../models/Metric.js';
import { Activity } from '../models/Activity.js';

const router = Router();

/**
 * PUBLIC_INTERFACE
 * GET /metrics/stats
 * Summary: Returns aggregated metric stats.
 * Description:
 *   Provides recent metric entries and basic aggregates for dashboard stat cards.
 * Security: Requires a valid JWT (authRequired).
 * Response:
 *   200: {
 *     count: number,        // number of recent metric points returned
 *     total: number,        // sum of the values
 *     average: number,      // average value
 *     latest: Array<{ _id, type, value, createdAt }>
 *   }
 */
router.get('/stats', authRequired, async (req, res, next) => {
  try {
    const latest = await Metric.find().sort({ createdAt: -1 }).limit(20).lean();
    const total = latest.reduce((sum, m) => sum + (Number(m.value) || 0), 0);
    res.json({
      count: latest.length,
      total,
      average: latest.length ? total / latest.length : 0,
      latest
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
 *   Lists recent actions (login, user CRUD, etc.) to display in the Activity page.
 * Security: Requires a valid JWT (authRequired).
 * Response:
 *   200: Array<{
 *     id: string,
 *     time: string,
 *     user: string,
 *     action: string,
 *     details?: any
 *   }>
 */
router.get('/activity', authRequired, async (req, res, next) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(30).lean();
    res.json(
      activities.map((a) => ({
        id: String(a._id),
        time: a.createdAt,
        user: a.userEmail || 'system',
        action: a.action,
        details: a.details
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
