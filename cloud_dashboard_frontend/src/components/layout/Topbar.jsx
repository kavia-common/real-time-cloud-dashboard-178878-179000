import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import LiveIndicator from '../ui/LiveIndicator';
import '../../styles/theme.css';

export default function Topbar({ onMenu }) {
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Show global live status for metrics namespace by default.
  const { connected } = useSocket('/metrics');

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={onMenu} aria-label="Open menu">☰</button>
      <div className="spacer" />
      <div className="topbar-actions">
        <LiveIndicator connected={connected} className="mr-2" />
        <button className="btn ghost" onClick={toggleTheme} aria-label="Toggle theme">
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="profile" onBlur={() => setOpen(false)} tabIndex={0}>
          <button className="btn" onClick={() => setOpen((o) => !o)}>
            {user?.name || 'Guest'}
          </button>
          {open && (
            <div className="menu">
              <a href="/profile">Profile</a>
              <button className="link-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
