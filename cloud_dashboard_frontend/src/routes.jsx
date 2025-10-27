import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import DrawerNav from './components/layout/DrawerNav';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';

import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import UIShowcase from './pages/UIShowcase';

export default function AppRoutes() {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="app">
      <Sidebar />
      <Topbar onMenu={() => setDrawer(true)} />
      <main className="main" role="main" aria-live="polite">
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute roles={['admin', 'user']} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ui-showcase" element={<UIShowcase />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <DrawerNav open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
