import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid userEmail format'
      }
    },
    action: { type: String, required: true, trim: true, index: true },
    details: { type: String, trim: true, maxlength: 500 },
    meta: { type: Object }
  },
  { timestamps: true }
);

// Compound index for querying by action and time
ActivitySchema.index({ action: 1, createdAt: -1 });
// Recent activities by time
ActivitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model('Activity', ActivitySchema);
