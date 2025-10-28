import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_STORAGE_KEY, clearAuthAndRedirect } from '../api/http';
import endpoints, { apiAuth } from '../api/endpoints';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** React hook to access Auth context. */
  return useContext(AuthContext);
}

/** Export as both named and default to satisfy various import styles. */
// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state and actions for the app. */
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const saveSession = (jwt, userInfo) => {
    setToken(jwt);
    setUser(userInfo);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, jwt);
      localStorage.setItem('user', JSON.stringify(userInfo));
    } catch {
      // ignore storage errors
    }
  };

  const clearSession = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
  };

  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    /** Performs login with credentials and persists session. */
    setLoading(true);
    try {
      const { data } = await apiAuth.login({ email, password });
      if (data?.token && data?.user) {
        saveSession(data.token, data.user);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: 'Invalid response' };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const register = async (payloadOrName, emailMaybe, passwordMaybe) => {
    /** Registers new user and persists session.
     * Accepts either (name, email, password) or an object payload {name,email,password}
     */
    setLoading(true);
    try {
      const payload = typeof payloadOrName === 'object'
        ? payloadOrName
        : { name: payloadOrName, email: emailMaybe, password: passwordMaybe };
      const { data } = await apiAuth.register(payload);
      if (data?.token && data?.user) {
        saveSession(data.token, data.user);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: 'Invalid response' };
    } catch (e) {
      return { ok: false, error: e?.response?.data?.message || 'Register failed' };
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const me = async () => {
    /** Fetches current user profile and updates local state. */
    if (!token) return null;
    try {
      const { data } = await api.get(endpoints.me);
      const u = data?.user || data;
      setUser(u);
      try {
        localStorage.setItem('user', JSON.stringify(u));
      } catch {}
      return u;
    } catch {
      // token likely invalid now
      clearSession();
      return null;
    }
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    /** Clears session and redirects to login page. */
    clearSession();
    clearAuthAndRedirect();
  };

  // Restore session on load if token exists
  useEffect(() => {
    (async () => {
      if (token && !user) {
        await me();
      }
      setBootstrapped(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      bootstrapped,
      login,
      register,
      me,
      logout,
      isAuthenticated: !!token && !!user,
      role: user?.role || 'user',
    }),
    [token, user, loading, bootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default AuthProvider;
