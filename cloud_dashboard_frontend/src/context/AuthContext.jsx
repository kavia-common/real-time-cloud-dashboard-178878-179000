import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import http, { registerAuthBridge } from '../api/http';
import { endpoints } from '../api/endpoints';

// Storage keys
const LS_KEY = 'clouddash_auth_v1';

// Shape:
// {
//   token: string | null,
//   user: object | null
// }

// Helpers for localStorage (guarded for SSR)
const safeStorage = {
  get() {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  },
  set(data) {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
  },
};

// Context
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export const useAuth = () => {
  /** Hook to access authentication state and actions */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides auth state (token, user) and actions (login, register, logout).
   * Persists session in localStorage and integrates with http client for 401 handling.
   */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const saved = safeStorage.get();
    if (saved?.token) setToken(saved.token);
    if (saved?.user) setUser(saved.user);
    setInitializing(false);
    // Register bridge for axios to access token and handle 401
    registerAuthBridge({
      getToken: () => saved?.token ?? token,
      onUnauthorized: () => {
        // central logout on 401
        logout();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever auth changes
  useEffect(() => {
    if (!initializing) {
      safeStorage.set({ token, user });
    }
  }, [token, user, initializing]);

  const fetchMe = useCallback(async (tk) => {
    try {
      const res = await http.get(endpoints.auth.me, {
        headers: tk ? { Authorization: `Bearer ${tk}` } : {},
      });
      if (res?.data) {
        setUser(res.data.user || res.data);
      }
    } catch {
      // if /me fails, keep current user; backend might not have it
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await http.post(endpoints.auth.login, { email, password });
    const tk = res?.data?.token || res?.data?.accessToken || null;
    const usr = res?.data?.user || null;
    if (tk) setToken(tk);
    if (usr) setUser(usr);
    if (tk && !usr) await fetchMe(tk);
    return { token: tk, user: usr };
  }, [fetchMe]);

  const register = useCallback(async (payload) => {
    const res = await http.post(endpoints.auth.register, payload);
    const tk = res?.data?.token || res?.data?.accessToken || null;
    const usr = res?.data?.user || null;
    if (tk) setToken(tk);
    if (usr) setUser(usr);
    if (tk && !usr) await fetchMe(tk);
    return { token: tk, user: usr };
  }, [fetchMe]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    safeStorage.clear();
  }, []);

  // Keep bridge updated when token changes after init
  useEffect(() => {
    registerAuthBridge({
      getToken: () => token,
      onUnauthorized: () => {
        logout();
      },
    });
  }, [token, logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      login,
      register,
      logout,
      setUser, // optional exposure for profile updates
    }),
    [token, user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
