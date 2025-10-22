import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DrawerNav from './DrawerNav';
import '../../styles/theme.css';

export interface LayoutProps {
  children: React.ReactNode;
}

// PUBLIC_INTERFACE
/**
 * Main application layout component that wraps Sidebar, Topbar, and content area.
 * Handles mobile drawer navigation.
 */
export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar />
      <Topbar onMenu={() => setDrawerOpen(true)} />
      <main className="main">{children}</main>
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
