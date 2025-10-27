/**
 * RoleRoute - restricts access to users with one of the allowed roles.
 * Use inside ProtectedRoute.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function RoleRoute({ allowed = [] }) {
  /** Route guard enforcing allowed roles. */
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (!user || (allowed.length && !allowed.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
