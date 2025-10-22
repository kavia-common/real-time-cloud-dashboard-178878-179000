import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import '../../styles/theme.css';

export default function Topbar({ onMenu }) {
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={onMenu} aria-label="Open menu">☰</button>
      <div className="spacer" />
      <div className="topbar-actions">
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
