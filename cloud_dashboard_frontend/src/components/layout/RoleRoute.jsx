import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * RoleRoute enforces access control for nested routes.
 * - If roles prop provided and current user is not in allowed roles, redirect to home with info.
 * - If not authenticated, redirect to /login and preserve next path.
 */
export default function RoleRoute({ roles = [] }) {
  const { user, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  // While auth is initializing, avoid flicker
  if (initializing) {
    return <div className="muted" style={{ padding: 16 }}>Checking access…</div>;
  }

  // If route requires auth and user not authenticated
  if (roles.length > 0 && !isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // If user exists but lacks required role
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace state={{ notice: 'Access restricted to administrators.' }} />;
  }

  return <Outlet />;
}
