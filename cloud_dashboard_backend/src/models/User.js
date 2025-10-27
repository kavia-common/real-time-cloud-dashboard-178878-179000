import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email address',
      },
    },
    passwordHash: { type: String, required: true, select: false, minlength: 60, maxlength: 120 },
    role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'invited', 'disabled'], default: 'active', index: true }
  },
  { timestamps: true }
);

// Helpful compound index for user listing by role/status and recency
UserSchema.index({ role: 1, status: 1, createdAt: -1 });

// PUBLIC_INTERFACE
UserSchema.methods.comparePassword = async function comparePassword(plain) {
  /** Compare plaintext password against stored hash. */
  return bcrypt.compare(plain, this.passwordHash);
};

// PUBLIC_INTERFACE
UserSchema.statics.hashPassword = async function hashPassword(plain) {
  /** Produce bcrypt hash for a plaintext password. */
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const User = mongoose.model('User', UserSchema);
