import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards nested routes to authenticated users.
 * Redirects to /login with from state if unauthenticated.
 * Shows a lightweight loading state while auth initializes.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="page" aria-busy="true" aria-live="polite">
        <div className="card" role="status" style={{ padding: 24 }}>
          <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 12, background: 'var(--color-border)' }} />
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8, background: 'var(--color-border)' }} />
          <div className="skeleton" style={{ height: 12, width: '55%', background: 'var(--color-border)' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
