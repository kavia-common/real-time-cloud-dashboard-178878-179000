/**
 * Topbar - header with user profile and actions.
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="font-medium text-gray-900">Real-Time Cloud Dashboard</div>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-400"> • </span>
              <span className="uppercase text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
