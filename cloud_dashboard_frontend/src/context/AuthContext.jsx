import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import http from '../api/http';
import endpoints from '../api/endpoints';
import { useNavigate, useLocation, NavigateFunction } from 'react-router-dom';

/**
 * Auth context:
 * - Persists JWT/user in localStorage
 * - Validates session on app init via GET /auth/me
 * - Listens to global 401 events from axios to auto-logout and redirect to /login
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  // persist token
  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  // persist user
  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  // validate existing token on app init
  useEffect(() => {
    let mounted = true;
    async function init() {
      if (token) {
        try {
          const { data } = await http.get(endpoints.auth.profile);
          if (mounted) {
            setUser(data);
          }
        } catch {
          // invalid token -> clear
          setToken(null);
          setUser(null);
        }
      }
      if (mounted) setBootstrapped(true);
    }
    init();
    return () => {
      mounted = false;
    };
  }, []); // run once

  // global 401 listener from http client
  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
      // redirect to login preserving path
      try {
        const current = window.location.pathname + window.location.search;
        const url = `/login?from=${encodeURIComponent(current)}`;
        if (window.location.pathname !== '/login') {
          window.history.replaceState({}, '', url);
          // force navigation by dispatching a popstate (for SPA)
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } catch {}
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),

    // PUBLIC_INTERFACE
    login: async (email, password) => {
      /** Perform login via POST /auth/login and persist token+user. */
      setLoading(true);
      try {
        const { data } = await http.post(endpoints.auth.login, { email, password });
        setToken(data.token);
        setUser(data.user);
        return data;
      } finally {
        setLoading(false);
      }
    },

    // PUBLIC_INTERFACE
    register: async (name, email, password) => {
      /** Register via POST /auth/register and persist token+user. */
      setLoading(true);
      try {
        const { data } = await http.post(endpoints.auth.register, { name, email, password });
        setToken(data.token);
        setUser(data.user);
        return data;
      } finally {
        setLoading(false);
      }
    },

    // PUBLIC_INTERFACE
    logout: () => {
      /** Clears auth token and user info, and redirects to /login. */
      setToken(null);
      setUser(null);
      try {
        const url = '/login';
        window.history.replaceState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {}
    },

    // PUBLIC_INTERFACE
    setAuth: (newToken, newUser) => {
      /** Sets token and user manually. */
      setToken(newToken || null);
      setUser(newUser || null);
    },
  }), [token, user, loading]);

  // Optionally render nothing until initial validation completes to avoid flicker
  if (!bootstrapped) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Returns auth state and helpers: isAuthenticated, login, logout, register. */
  return useContext(AuthContext);
}
