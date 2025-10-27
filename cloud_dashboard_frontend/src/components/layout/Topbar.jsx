/**
 * Topbar - Ocean Professional styled header with brand, actions, and user menu.
 * - Responsive: shows menu button on small screens to open DrawerNav
 * - Accessibility: ARIA labels, keyboard navigable user menu
 * - Integrates with AuthContext for logout
 * - Supports an optional search slot via children or render prop
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/theme.css';

/**
 * Props:
 * - title?: string - brand title (default: "Cloud Dashboard")
 * - onMenu?: () => void - called when mobile menu button is clicked
 * - rightActions?: React.ReactNode - optional right-side custom actions (e.g., notifications)
 * - children?: React.ReactNode - optional content for search/input area centered on larger screens
 */
// PUBLIC_INTERFACE
export default function Topbar({ title = 'Cloud Dashboard', onMenu, rightActions, children }) {
  const { user, logout } = useAuth();

  // Simple initials avatar from user name/email
  const initials = useMemo(() => {
    const src = user?.name || user?.email || 'User';
    return src
      .split(' ')
      .map((s) => s.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user]);

  // User menu handling
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  const handleToggleMenu = () => setMenuOpen((v) => !v);

  return (
    <header
      className="topbar"
      role="banner"
      aria-label="Top navigation bar"
    >
      {/* Left cluster: mobile menu button + brand */}
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn md-hidden"
          aria-label="Open navigation menu"
          onClick={onMenu}
        >
          {/* Hamburger icon */}
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <div className="brand">
          <div className="brand-mark-sm" aria-hidden="true">☁</div>
          <div className="brand-texts">
            <div className="brand-title">{title}</div>
            <div className="brand-sub">Ocean Professional</div>
          </div>
        </div>
      </div>

      {/* Middle: optional search slot (hidden on very small screens) */}
      <div className="topbar-center" role="search">
        {children}
      </div>

      {/* Right cluster: custom actions + user menu */}
      <div className="topbar-right">
        <div className="actions">{rightActions}</div>

        {user ? (
          <div className="user-area">
            <button
              ref={btnRef}
              className="user-btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="user-menu"
              onClick={handleToggleMenu}
            >
              <span className="avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="user-meta">
                <span className="user-name">{user.name || user.email}</span>
                {user.role && (
                  <span className="user-role badge-role" aria-label={`Role: ${user.role}`}>
                    {user.role}
                  </span>
                )}
              </span>
            </button>

            {menuOpen && (
              <div
                id="user-menu"
                role="menu"
                ref={menuRef}
                className="user-menu"
                aria-label="User menu"
              >
                <div className="user-menu-head" role="none">
                  <div className="avatar lg" aria-hidden="true">{initials}</div>
                  <div>
                    <div className="user-name">{user.name || user.email}</div>
                    {user.email && <div className="muted small">{user.email}</div>}
                  </div>
                </div>
                <div className="user-menu-body" role="none">
                  <button className="menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    Profile
                  </button>
                  <button className="menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    Settings
                  </button>
                </div>
                <div className="user-menu-footer" role="none">
                  <button
                    className="btn ghost w-full"
                    role="menuitem"
                    onClick={logout}
                    aria-label="Log out"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="user-area">
            <a className="btn ghost" href="/login">
              Sign in
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
