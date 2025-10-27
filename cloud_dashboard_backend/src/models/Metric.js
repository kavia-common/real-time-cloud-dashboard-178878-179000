import mongoose from 'mongoose';

/**
 * Metric schema to store time-series metrics and aggregated counters.
 * - key: metric name (e.g., cpu_usage, requests_per_minute)
 * - value: numeric value
 * - metadata: additional context (source, tags, etc.)
 * - timestamps: createdAt/updatedAt
 */
const MetricSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, index: true },
    value: { type: Number, required: true, default: 0 },
    metadata: { type: Object, default: {} },
    source: { type: String, default: 'system', index: true },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Index for recent metrics by key
MetricSchema.index({ key: 1, createdAt: -1 });
// Index by source and time
MetricSchema.index({ source: 1, createdAt: -1 });

export const Metric = mongoose.model('Metric', MetricSchema);
