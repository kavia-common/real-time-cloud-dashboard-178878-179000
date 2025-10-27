import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/theme.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navRef = useRef(null);

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

  // Close submenus when clicking outside on mobile and set default collapsed on small screens
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

  // Keyboard navigation for submenu (Left/Right arrows)
  const onKeyDownLink = (e, index, hasSubmenu) => {
    if (!hasSubmenu) return;
    if (e.key === 'ArrowRight') {
      setActiveSubmenu(index);
    } else if (e.key === 'ArrowLeft') {
      setActiveSubmenu(null);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`} role="complementary" aria-label="Primary">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand" aria-label="CloudDash brand">
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
            aria-expanded={!isCollapsed}
            aria-controls="sidebar-nav"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav id="sidebar-nav" className="sidebar-nav" role="navigation" aria-label="Main" ref={navRef}>
          <ul className="sidebar-links" role="tree">
            {links.map((link, index) => {
              const isActive = pathname === link.to || link.subItems?.some(item => item.to === pathname);
              const hasSubmenu = link.subItems && link.subItems.length > 0;
              
              return (
                <li key={link.to} className="sidebar-item" role="treeitem" aria-expanded={hasSubmenu ? activeSubmenu === index : undefined}>
                  {hasSubmenu ? (
                    <>
                      <button
                        className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                        onClick={() => toggleSubmenu(index)}
                        onKeyDown={(e) => onKeyDownLink(e, index, hasSubmenu)}
                        aria-haspopup="true"
                        aria-expanded={activeSubmenu === index}
                        aria-controls={`submenu-${index}`}
                      >
                        <span className="sidebar-icon">{link.icon}</span>
                        <span className="sidebar-label">{link.label}</span>
                        <span className={`sidebar-chevron ${activeSubmenu === index ? 'sidebar-chevron--open' : ''}`}>
                          ▼
                        </span>
                      </button>
                      
                      {/* Submenu */}
                      <div id={`submenu-${index}`} className={`sidebar-submenu ${activeSubmenu === index ? 'sidebar-submenu--open' : ''}`} role="group">
                        {link.subItems.map((subItem) => {
                          const active = pathname === subItem.to;
                          return (
                            <Link
                              key={subItem.to}
                              to={subItem.to}
                              className={`sidebar-sublink ${active ? 'sidebar-sublink--active' : ''}`}
                              aria-current={active ? 'page' : undefined}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.to}
                      className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
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
          <div className="user-profile" role="contentinfo" aria-label="Signed in user">
            <div className="user-avatar">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
                alt="User avatar" 
              />
            </div>
            <div className="user-info">
              <span className="user-name">John Doe</span>
              <span className="user-role">Admin</span>
            </div>
            <div className="user-status" aria-label="Online status" />
          </div>
        </div>

        <style jsx>{`
          /* styles unchanged (same as before) */
        `}</style>
      </aside>
    </>
  );
}