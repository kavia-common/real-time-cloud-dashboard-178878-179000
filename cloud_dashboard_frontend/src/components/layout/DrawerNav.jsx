import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/theme.css';

export default function DrawerNav({ open, onClose }) {
  const { pathname } = useLocation();

  return (
    <div
      aria-hidden={!open}
      className="drawer-overlay"
      onClick={onClose}
      role="presentation"
      style={{ display: open ? 'block' : 'none' }}
    >
      <nav
        className="drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Mobile navigation"
      >
        <div className="drawer-header">
          <span className="brand">CloudDash</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <ul className="drawer-links">
          {[
            { to: '/', label: 'Dashboard' },
            { to: '/users', label: 'Users' },
            { to: '/activity', label: 'Activity' },
            { to: '/settings', label: 'Settings' },
          ].map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={onClose}
                className={pathname === l.to ? 'active' : ''}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
