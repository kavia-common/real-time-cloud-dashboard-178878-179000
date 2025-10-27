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
  const latest = await Metric.find().sort({ createdAt: -1 }).limit(50).lean();
  const total = latest.reduce((sum, m) => sum + (m.value || 0), 0);
  const count = latest.length;
  const average = count ? total / count : 0;

  // Provide common dashboard fields used in UI
  const resp = {
    count,
    total,
    average,
    latest,
    activeUsers: Math.max(0, Math.round(average / 2)),
    rpm: Math.round(average),
    errors: Math.max(0, Math.round(average * 0.1)),
    activeUsersTrend: Math.round((Math.random() - 0.5) * 10),
    rpmTrend: Math.round((Math.random() - 0.5) * 10),
    errorsTrend: Math.round((Math.random() - 0.5) * 10),
  };

  res.json(resp);
});

/**
 * GET /metrics/activity
 * Returns recent activities for feed with pagination.
 * Query: ?page=<number>&limit=<number>
 */
router.get('/activity', authRequired, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Activity.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Activity.estimatedDocumentCount(),
  ]);

  res.json({
    page,
    limit,
    total,
    items: items.map((a) => ({
      id: a._id,
      time: a.createdAt,
      user: a.userEmail || 'system',
      action: a.action,
      details: a.details,
    })),
  });
});

export default router;
