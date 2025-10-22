import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards nested routes by role; if roles prop provided and user not in roles, redirect to /.
 */
export default function RoleRoute({ roles = [] }) {
  const { user } = useAuth();
  if (roles.length && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
