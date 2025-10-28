import mongoose from 'mongoose';

/**
 * Metric schema to store time-series metrics and aggregated counters.
 * - key: metric name (e.g., cpu_usage, requests_per_minute)
 * - value: numeric value
 * - metadata: additional context (userCount, activityRate, etc.)
 * - source: origin of the metric (system, api, socket, etc.)
 * - tags: categorization tags for filtering
 * - timestamps: createdAt/updatedAt (automatic)
 * 
 * Indexes optimized for:
 * - Recent metrics queries by key (dashboard stats)
 * - Time-range queries for analytics
 * - Source-based filtering
 */
const MetricSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, index: true },
    value: { type: Number, required: true, default: 0, min: [0, 'Metric value must be >= 0'] },
    metadata: { type: Object, default: {} },
    source: { type: String, default: 'system', index: true },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Compound index for efficient recent metrics by key queries
MetricSchema.index({ key: 1, createdAt: -1 });

// Index for time-range queries (used in /metrics/stats with date filters)
MetricSchema.index({ createdAt: -1 });

/** Additional indexes */
// Index by source and time for analytics
MetricSchema.index({ source: 1, createdAt: -1 });
// Tags array index for filtering
MetricSchema.index({ tags: 1, createdAt: -1 });

export const Metric = mongoose.model('Metric', MetricSchema);
