import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/theme.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/users', label: 'Users' },
    { to: '/activity', label: 'Activity' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand">CloudDash</span>
      </div>
      <ul className="sidebar-links">
        {links.map((l) => (
          <li key={l.to}>
            <Link className={pathname === l.to ? 'active' : ''} to={l.to}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
