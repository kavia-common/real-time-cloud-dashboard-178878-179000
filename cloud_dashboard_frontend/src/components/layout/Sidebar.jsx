/**
 * Sidebar - application navigation with Ocean Professional theme.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  }`;

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full p-4 hidden md:block">
      <div className="mb-6">
        <div className="text-xl font-semibold text-gray-900">Cloud Dashboard</div>
        <div className="text-xs text-gray-500">Ocean Professional</div>
      </div>
      <nav className="space-y-1">
        <NavLink to="/" className={navItemClass} end>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/activity" className={navItemClass}>
          <span>Activity</span>
        </NavLink>
        <NavLink to="/users" className={navItemClass}>
          <span>Users</span>
        </NavLink>
        <NavLink to="/settings" className={navItemClass}>
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
