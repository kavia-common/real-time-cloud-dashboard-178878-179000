import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button.tsx';

export default function Settings() {
  const { user } = useAuth();

  // Minimal theme toggling if ThemeContext exists; fall back to no-op
  let themeLabel = 'theme';
  let toggleTheme = null;
  try {
    // dynamic import to avoid breaking if not present
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { useTheme } = require('../context/ThemeContext');
    const hook = useTheme?.();
    themeLabel = hook?.theme || 'system';
    toggleTheme = hook?.toggleTheme || null;
  } catch {
    // ignore
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <div className="font-semibold">Profile</div>
        <div className="text-sm text-gray-600">Name: {user?.name}</div>
        <div className="text-sm text-gray-600">Email: {user?.email}</div>
        <div className="text-sm text-gray-600">Role: {user?.role}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <div className="font-semibold">Preferences</div>
        <div className="flex items-center justify-between">
          <span>Theme</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{themeLabel}</span>
            <Button variant="secondary" onClick={() => toggleTheme && toggleTheme()}>Toggle Theme</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
