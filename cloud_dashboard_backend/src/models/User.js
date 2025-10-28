import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User schema with:
 * - unique email index
 * - timestamps
 * - instance/static methods for password hashing/comparison
 * - status and role fields
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    // We keep passwordHash to align with existing auth routes
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'disabled'],
      default: 'active'
    }
  },
  { timestamps: true }
);

/**
 * Indexes:
 * - Unique email (lowercased)
 * - status
 * - role+status for admin/user filtering
 */
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1, status: 1 });

/**
 * PUBLIC_INTERFACE
 * Compare plaintext password against stored hash.
 */
UserSchema.methods.comparePassword = async function comparePassword(plain) {
  // Ensure we have the hash; if not selected, fetch it
  let hash = this.passwordHash;
  if (!hash) {
    const fresh = await this.constructor.findById(this._id).select('+passwordHash');
    hash = fresh?.passwordHash;
  }
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
};

// PUBLIC_INTERFACE
UserSchema.statics.hashPassword = async function hashPassword(plain) {
  /** Produce bcrypt hash for a plaintext password. */
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const User = mongoose.model('User', UserSchema);
