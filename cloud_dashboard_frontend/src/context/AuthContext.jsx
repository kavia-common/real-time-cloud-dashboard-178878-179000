/**
 * AuthContext - manages authentication state, token, and user profile.
 * - Persists token and user in localStorage
 * - Validates session via /auth/me on load
 * - Provides login, register, logout methods
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import http, { setAccessToken } from '../api/http';
import { endpoints } from '../api/endpoints';

const ACCESS_TOKEN_KEY = 'rtcd_access_token';
const USER_KEY = 'rtcd_user';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export const useAuth = () => {
  /** Hook to access authentication state and actions. */
  return useContext(AuthContext);
};

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides auth state and actions to the app.
   */
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((token, userData) => {
    // Persist token always so axios can use it on subsequent calls
    if (token) {
      try { localStorage.setItem(ACCESS_TOKEN_KEY, token); } catch { /* ignore */ }
      setAccessToken(token);
    }
    if (userData) {
      setUser(userData);
      try { localStorage.setItem(USER_KEY, JSON.stringify(userData)); } catch { /* ignore */ }
    }
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await http.get(endpoints.auth.me);
      if (res?.data) {
        saveSession(null, res.data);
      }
    } catch (e) {
      // handled globally (401)
    }
  }, [saveSession]);

  // Initialize - if token exists, attempt to fetch profile
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await fetchMe();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const res = await http.post(endpoints.auth.login, { email, password });
    const { token, user: userData } = res.data || {};
    saveSession(token, userData);
    // Refresh profile (authoritative)
    try { await fetchMe(); } catch { /* ignore */ }
    return userData;
  }, [saveSession, fetchMe]);

  const register = useCallback(async (name, email, password, role = 'user') => {
    const res = await http.post(endpoints.auth.register, { name, email, password, role });
    const { token, user: userData } = res.data || {};
    saveSession(token, userData);
    try { await fetchMe(); } catch { /* ignore */ }
    return userData;
  }, [saveSession, fetchMe]);

  const logout = useCallback(async () => {
    try {
      await http.post(endpoints.auth.logout);
    } catch {
      // ignore
    } finally {
      clearSession();
      window.location.replace('/login');
    }
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshMe: fetchMe,
  }), [user, loading, login, register, logout, fetchMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
