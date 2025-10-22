import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Basic auth context handling:
 * - Stores token and user in localStorage
 * - login/logout placeholders
 * - PUBLIC_INTERFACE methods and docstrings provided per guidelines
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

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: Boolean(token),

    // PUBLIC_INTERFACE
    login: async (email, password) => {
      /**
       * Login placeholder:
       * In future: call API, receive token and user.
       * For now: mock token and basic user role for navigation testing.
       */
      setLoading(true);
      try {
        const mockToken = 'mock-token';
        const mockUser = { id: '1', email, name: 'Demo User', role: 'admin' };
        setToken(mockToken);
        setUser(mockUser);
        return { token: mockToken, user: mockUser };
      } finally {
        setLoading(false);
      }
    },

    // PUBLIC_INTERFACE
    logout: () => {
      /** Clears auth token and user info. */
      setToken(null);
      setUser(null);
    },

    // PUBLIC_INTERFACE
    setAuth: (newToken, newUser) => {
      /** Sets token and user manually. */
      setToken(newToken || null);
      setUser(newUser || null);
    },
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Returns auth state and helpers: isAuthenticated, login, logout. */
  return useContext(AuthContext);
}
