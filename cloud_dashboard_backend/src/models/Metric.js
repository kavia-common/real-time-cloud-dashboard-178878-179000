import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
      match: [/^[a-z0-9_:. -]+$/i, 'Metric type contains invalid characters'],
    }, // e.g., 'requests_per_min', 'error_rate'
    value: {
      type: Number,
      required: true,
      min: [0, 'Metric value must be >= 0'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((t) => typeof t === 'string' && t.length <= 40),
        message: 'Invalid tag in tags array',
      },
      index: true,
    }
  },
  { timestamps: true }
);

// Help frequent queries: latest metrics by type
MetricSchema.index({ type: 1, createdAt: -1 });

export const Metric = mongoose.model('Metric', MetricSchema);
