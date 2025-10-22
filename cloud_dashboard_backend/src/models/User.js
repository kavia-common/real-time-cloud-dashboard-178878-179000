import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    status: { type: String, enum: ['active', 'invited', 'disabled'], default: 'active' }
  },
  { timestamps: true }
);

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
