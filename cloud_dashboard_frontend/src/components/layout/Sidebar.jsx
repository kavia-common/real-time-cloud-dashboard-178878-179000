import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/theme.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const links = [
    { 
      to: '/', 
      label: 'Dashboard', 
      icon: '📊',
      subItems: [
        { to: '/', label: 'Overview' },
        { to: '/analytics', label: 'Analytics' },
        { to: '/reports', label: 'Reports' }
      ]
    },
    { 
      to: '/users', 
      label: 'Users', 
      icon: '👥',
      subItems: [
        { to: '/users', label: 'All Users' },
        { to: '/users/new', label: 'Add User' },
        { to: '/users/roles', label: 'Roles' }
      ]
    },
    { 
      to: '/activity', 
      label: 'Activity', 
      icon: '📈',
      subItems: [
        { to: '/activity', label: 'Recent' },
        { to: '/activity/logs', label: 'Logs' },
        { to: '/activity/audit', label: 'Audit Trail' }
      ]
    },
    { 
      to: '/settings', 
      label: 'Settings', 
      icon: '⚙️',
      subItems: [
        { to: '/settings', label: 'General' },
        { to: '/settings/security', label: 'Security' },
        { to: '/settings/integrations', label: 'Integrations' }
      ]
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setActiveSubmenu(null);
  };

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  // Close submenus when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">🚀</div>
            <div className="brand-text">
              <span className="brand-name">CloudDash</span>
              <span className="brand-version">v2.0</span>
            </div>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-links">
            {links.map((link, index) => {
              const isActive = pathname === link.to || link.subItems?.some(item => item.to === pathname);
              const hasSubmenu = link.subItems && link.subItems.length > 0;
              
              return (
                <li key={link.to} className="sidebar-item">
                  {hasSubmenu ? (
                    <>
                      <button
                        className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                        onClick={() => toggleSubmenu(index)}
                      >
                        <span className="sidebar-icon">{link.icon}</span>
                        <span className="sidebar-label">{link.label}</span>
                        <span className={`sidebar-chevron ${activeSubmenu === index ? 'sidebar-chevron--open' : ''}`}>
                          ▼
                        </span>
                      </button>
                      
                      {/* Submenu */}
                      <div className={`sidebar-submenu ${activeSubmenu === index ? 'sidebar-submenu--open' : ''}`}>
                        {link.subItems.map((subItem) => (
                          <Link
                            key={subItem.to}
                            to={subItem.to}
                            className={`sidebar-sublink ${pathname === subItem.to ? 'sidebar-sublink--active' : ''}`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.to}
                      className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                    >
                      <span className="sidebar-icon">{link.icon}</span>
                      <span className="sidebar-label">{link.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
                alt="User" 
              />
            </div>
            <div className="user-info">
              <span className="user-name">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
            <div className="user-status"></div>
          </div>
        </div>

        <style jsx>{`
          /* Sidebar Base Styles */
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 280px;
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
            border-right: 1px solid #334155;
            display: flex;
            flex-direction: column;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
          }

          .sidebar--collapsed {
            width: 80px;
          }

          /* Mobile Overlay */
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            backdrop-filter: blur(2px);
          }

          /* Header */
          .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem 1rem;
            border-bottom: 1px solid #334155;
          }

          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: opacity 0.3s ease;
          }

          .sidebar--collapsed .sidebar-brand {
            opacity: 0;
            pointer-events: none;
          }

          .brand-logo {
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .brand-text {
            display: flex;
            flex-direction: column;
          }

          .brand-name {
            font-weight: 700;
            color: white;
            font-size: 1.25rem;
          }

          .brand-version {
            font-size: 0.75rem;
            color: #94a3b8;
          }

          .sidebar-toggle {
            width: 32px;
            height: 32px;
            border: 1px solid #334155;
            background: #1e293b;
            color: #94a3b8;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .sidebar-toggle:hover {
            background: #334155;
            color: white;
          }

          /* Navigation */
          .sidebar-nav {
            flex: 1;
            padding: 1rem 0.5rem;
            overflow-y: auto;
          }

          .sidebar-links {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .sidebar-item {
            margin-bottom: 0.25rem;
          }

          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            color: #cbd5e1;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.2s ease;
            border: none;
            background: none;
            width: 100%;
            cursor: pointer;
            position: relative;
          }

          .sidebar-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            transform: translateX(4px);
          }

          .sidebar-link--active {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(29, 78, 216, 0.1));
            color: white;
            border-left: 3px solid #3b82f6;
          }

          .sidebar-icon {
            font-size: 1.25rem;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .sidebar-label {
            font-weight: 500;
            font-size: 0.95rem;
            transition: opacity 0.3s ease;
          }

          .sidebar--collapsed .sidebar-label {
            opacity: 0;
            pointer-events: none;
          }

          .sidebar-chevron {
            margin-left: auto;
            transition: transform 0.2s ease;
            font-size: 0.75rem;
            color: #94a3b8;
          }

          .sidebar-chevron--open {
            transform: rotate(180deg);
          }

          .sidebar--collapsed .sidebar-chevron {
            display: none;
          }

          /* Submenu */
          .sidebar-submenu {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 6px;
            margin: 0.25rem 0.5rem;
          }

          .sidebar-submenu--open {
            max-height: 200px;
          }

          .sidebar-sublink {
            display: block;
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            color: #94a3b8;
            text-decoration: none;
            font-size: 0.875rem;
            border-radius: 4px;
            transition: all 0.2s ease;
            position: relative;
          }

          .sidebar-sublink:hover {
            color: white;
            background: rgba(255, 255, 255, 0.05);
          }

          .sidebar-sublink--active {
            color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
          }

          .sidebar-sublink--active::before {
            content: '';
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 4px;
            background: #3b82f6;
            border-radius: 50%;
          }

          .sidebar--collapsed .sidebar-submenu {
            display: none;
          }

          /* Footer */
          .sidebar-footer {
            padding: 1rem;
            border-top: 1px solid #334155;
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            transition: opacity 0.3s ease;
          }

          .sidebar--collapsed .user-profile {
            opacity: 0;
            pointer-events: none;
          }

          .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #3b82f6;
          }

          .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .user-info {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .user-name {
            font-weight: 600;
            color: white;
            font-size: 0.875rem;
          }

          .user-role {
            font-size: 0.75rem;
            color: #94a3b8;
          }

          .user-status {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          /* Scrollbar */
          .sidebar-nav::-webkit-scrollbar {
            width: 4px;
          }

          .sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar-nav::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 2px;
          }

          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
            }

            .sidebar--collapsed {
              transform: translateX(0);
              width: 280px;
            }

            .sidebar--collapsed .sidebar-brand,
            .sidebar--collapsed .sidebar-label,
            .sidebar--collapsed .user-profile {
              opacity: 1;
              pointer-events: all;
            }

            .sidebar-toggle {
              display: none;
            }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .sidebar,
            .sidebar-link,
            .sidebar-submenu {
              transition: none;
            }
            
            .sidebar-link:hover {
              transform: none;
            }
          }
        `}</style>
      </aside>
    </>
  );
}