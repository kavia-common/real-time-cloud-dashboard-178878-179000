import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function RoleRoute({ role, roles }) {
  /** Guards routes for specific role(s). Redirects appropriately on mismatch or unauthenticated. */
  const { isAuthenticated, user, bootstrapped } = useAuth();

  const allowed = Array.isArray(roles) ? roles : role ? [role] : [];

  if (!bootstrapped) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowed.length > 0 && !allowed.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
