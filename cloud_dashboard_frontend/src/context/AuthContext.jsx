/**
 * AuthContext - manages authentication state, token, and user profile.
 * - Persists token and user in localStorage
 * - Validates session via /auth/me on load (only if token exists)
 * - Provides login, register, logout methods
 * - Gracefully handles blocked requests and surfaces diagnostics
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import http, { setAccessToken, getAccessToken, healthCheck, safeGetWithRetry } from '../api/http';
import { endpoints, API_BASE_URL } from '../api/endpoints';

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
  const [connectivity, setConnectivity] = useState({ ok: true, lastChecked: null, tip: '' });

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
    const token = getAccessToken();
    if (!token) {
      // no token, skip call entirely to avoid adblock heuristics and noise
      return;
    }
    try {
      const res = await safeGetWithRetry(endpoints.auth.me, {
        // ensure Authorization header included even if interceptor misses
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data) {
        saveSession(null, res.data);
      }
    } catch (e) {
      // If network-level failure (likely adblock/CORS), probe health and log guidance
      const isNetworkLevel =
        !e?.response &&
        (e?.code === 'ERR_NETWORK' ||
          /Network Error/i.test(e?.message || '') ||
          /Blocked by client/i.test(e?.message || ''));

      if (isNetworkLevel) {
        const ok = await healthCheck();
        setConnectivity({
          ok,
          lastChecked: new Date().toISOString(),
          tip: ok
            ? 'Backend reachable, but the specific /auth/me request may be blocked by an extension. Consider whitelisting this site or set REACT_APP_API_PATH_PREFIX=/api.'
            : 'Backend not reachable. Confirm the server is running and REACT_APP_API_BASE_URL is correct.',
        });
        // eslint-disable-next-line no-console
        console.warn(
          '[Auth] /auth/me failed due to a network-level error. ' +
            `Base URL=${API_BASE_URL}. Health=${ok ? 'OK' : 'DOWN'}. ` +
            'If you use an ad/tracker blocker, please temporarily disable it for this site ' +
            'or configure REACT_APP_API_PATH_PREFIX=/api to use a proxy-like prefix.'
        );
      }
      // 401/other errors are handled globally by interceptor or ignored here
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
    connectivity,
    login,
    register,
    logout,
    refreshMe: fetchMe,
  }), [user, loading, connectivity, login, register, logout, fetchMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
