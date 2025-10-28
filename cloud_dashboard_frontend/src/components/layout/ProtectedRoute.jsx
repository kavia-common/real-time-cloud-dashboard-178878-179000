import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function ProtectedRoute() {
  /** Guards routes that require authentication. Redirects to /login when not authenticated. */
  const { isAuthenticated, bootstrapped } = useAuth();

  if (!bootstrapped) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
