import mongoose from 'mongoose';

/**
 * Activity schema for recording user and system actions.
 * - Indexes on createdAt (desc) and user for quick filters
 * - Timestamps enabled
 */
const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userEmail: { type: String, trim: true },
    action: {
      type: String,
      required: true,
      enum: ['login', 'logout', 'create_user', 'update_user', 'delete_user', 'metric_event', 'other'],
      index: true
    },
    details: { type: String, default: '', maxlength: 1024, trim: true },
    meta: { type: Object, default: {} },
    ip: { type: String, default: null }
  },
  { timestamps: true }
);

// Indexes
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', ActivitySchema);
