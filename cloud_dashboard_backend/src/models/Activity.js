import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true },
    details: { type: String },
    meta: { type: Object }
  },
  { timestamps: true }
);

export const Activity = mongoose.model('Activity', ActivitySchema);
