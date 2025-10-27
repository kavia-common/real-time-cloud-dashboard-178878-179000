import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Theme context provides theme mode and Ocean Professional CSS variables injection.
 * Exposes toggleTheme and setTheme, persists in localStorage, and defaults to prefers-color-scheme.
 */
const ThemeContext = createContext(null);

const STORAGE_KEY = 'theme_mode';

const OCEAN_THEME_VARS = {
  '--color-primary': '#2563EB',
  '--color-secondary': '#F59E0B',
  '--color-success': '#F59E0B',
  '--color-error': '#EF4444',
  '--color-bg': '#f9fafb',
  '--color-surface': '#ffffff',
  '--color-text': '#111827',
  '--shadow-md': '0 4px 10px rgba(0,0,0,0.06)',
  '--radius-md': '12px',
};

const OCEAN_DARK_OVERRIDES = {
  '--color-bg': '#0b1220',
  '--color-surface': '#0f172a',
  '--color-text': '#e5e7eb',
  '--shadow-md': '0 6px 16px rgba(0,0,0,0.35)',
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    // default to system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const vars = mode === 'dark'
      ? { ...OCEAN_THEME_VARS, ...OCEAN_DARK_OVERRIDES }
      : OCEAN_THEME_VARS;

    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    // PUBLIC_INTERFACE
    toggleTheme: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    // PUBLIC_INTERFACE
    setTheme: (next) => setMode(next === 'dark' ? 'dark' : 'light'),
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Returns theme mode and toggleTheme function. */
  return useContext(ThemeContext);
}

export default ThemeContext;
