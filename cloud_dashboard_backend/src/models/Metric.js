import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true }, // e.g., 'requests_per_min', 'error_rate'
    value: { type: Number, required: true },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Metric = mongoose.model('Metric', MetricSchema);
