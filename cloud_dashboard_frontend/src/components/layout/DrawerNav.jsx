import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaUsers,
  FaChartLine,
  FaCog,
  FaCloud,
  FaTimes,
} from 'react-icons/fa';
import '../../styles/theme.css';

export default function DrawerNav({ open, onClose }) {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/users', label: 'Users', icon: <FaUsers /> },
    { to: '/activity', label: 'Activity', icon: <FaChartLine /> },
    { to: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer */}
          <motion.nav
            className="fixed top-0 left-0 h-full w-72 bg-[#0a0a0a] text-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <FaCloud className="text-blue-500 text-2xl" />
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  CloudDash
                </span>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-white transition"
                onClick={onClose}
                aria-label="Close menu"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <ul className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {links.map(({ to, label, icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === to
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 text-xs text-gray-400">
              © 2025 CloudDash. All rights reserved.
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
