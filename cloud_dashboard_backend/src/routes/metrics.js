import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { Metric } from '../models/Metric.js';
import { Activity } from '../models/Activity.js';

const router = Router();

/**
 * GET /metrics/stats
 * Returns aggregated metric stats (demo implementation).
 */
router.get('/stats', authRequired, async (req, res) => {
  const latest = await Metric.find().sort({ createdAt: -1 }).limit(20).lean();
  const total = latest.reduce((sum, m) => sum + (m.value || 0), 0);
  res.json({
    count: latest.length,
    total,
    average: latest.length ? total / latest.length : 0,
    latest
  });
});

/**
 * GET /metrics/activity
 * Returns recent activities for feed.
 */
router.get('/activity', authRequired, async (req, res) => {
  const activities = await Activity.find().sort({ createdAt: -1 }).limit(30).lean();
  res.json(activities.map(a => ({
    id: a._id,
    time: a.createdAt,
    user: a.userEmail || 'system',
    action: a.action,
    details: a.details
  })));
});

export default router;
