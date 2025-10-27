import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import useSocket from '../../hooks/useSocket';
import LiveIndicator from '../ui/LiveIndicator';
import '../../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Topbar component with theme toggle, live indicator, and profile menu.
 * - Adds ARIA roles/labels
 * - Keyboard handling for Escape to close menu
 * - Works with mobile drawer trigger via onMenu
 */
export default function Topbar({ onMenu }) {
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Show global live status for metrics namespace by default.
  const { connected } = useSocket('/metrics');

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="topbar" role="banner">
      <button className="icon-btn mobile-only" onClick={onMenu} aria-label="Open menu">☰</button>
      <div className="spacer" />
      <div className="topbar-actions" role="group" aria-label="Topbar actions">
        <LiveIndicator connected={connected} className="mr-2" />
        <button className="btn ghost" onClick={toggleTheme} aria-label="Toggle theme">
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="profile" ref={menuRef}>
          <button
            className="btn"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {user?.name || 'Guest'}
          </button>
          {open && (
            <div
              className="menu"
              role="menu"
              aria-label="Profile menu"
              onBlur={(e) => {
                if (!menuRef.current?.contains(e.relatedTarget)) setOpen(false);
              }}
            >
              <a href="/profile" role="menuitem" tabIndex={0}>Profile</a>
              <button className="link-btn" onClick={handleLogout} role="menuitem">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
