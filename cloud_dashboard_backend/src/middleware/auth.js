import { User } from '../models/User.js';

/**
 * ensureDefaultAdmin
 * Idempotently ensures a default admin user exists based on env variables.
 * This is a no-op here because actual seeding occurs in config/db.js after connection.
 * We keep this to satisfy server.js import and allow future extensions (e.g., token strategies).
 */
// PUBLIC_INTERFACE
export async function ensureDefaultAdmin() {
  /** No-op: seeding handled during DB connect. Kept for backward compatibility. */
  return;
}

export default {
  ensureDefaultAdmin
};
