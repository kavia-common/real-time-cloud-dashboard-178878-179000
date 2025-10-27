import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiAuth } from '../api/endpoints';
import http, { subscribeAuth } from '../api/http';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export const useAuth = () => {
  /** Hook to access authentication state and actions */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * PUBLIC_INTERFACE
 * Provides application-wide authentication state and actions.
 * - Initializes state from localStorage
 * - Validates session via /auth/me on load
 * - Exposes login, register, and logout methods
 * - Persists token/user in localStorage
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Listen for unauthorized events from http client
  useEffect(() => {
    const unsubscribe = subscribeAuth((event) => {
      if (event === 'unauthorized') {
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } catch {
          // ignore
        }
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Bootstrap from localStorage and validate
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (token) {
          // Validate session
          const { data } = await apiAuth.me();
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          } else {
            // invalid token
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setUser(null);
          }
        }
      } catch {
        // if validation fails, clear session
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        } catch {}
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiAuth.login({ email, password });
    const { token, user: userData } = res.data || {};
    if (!token || !userData) {
      throw new Error('Invalid login response');
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await apiAuth.register({ name, email, password });
    const { token, user: userData } = res.data || {};
    if (!token || !userData) {
      throw new Error('Invalid register response');
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || 'user',
      initializing,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      setUser, // optional exposure for profile updates
    }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
