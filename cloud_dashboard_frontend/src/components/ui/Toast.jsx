import React, { useEffect, useState } from 'react';
import '../../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Toast notification component with auto-dismiss
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'info' | 'success' | 'warning' | 'error'
 * @param {number} duration - Auto-dismiss duration in ms (default 3000)
 * @param {function} onClose - Callback when toast closes
 * @param {boolean} show - Visibility control
 */
export default function Toast({ message, type = 'info', duration = 3000, onClose, show = true }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (!visible || !duration) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  };

  const colors = {
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xl)',
        padding: '12px 16px',
        borderLeft: `4px solid ${colors[type] || colors.info}`,
        zIndex: 'var(--z-toast)',
        borderRadius: 'var(--radius-lg)',
        minWidth: '280px',
        maxWidth: '420px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: 'var(--font-size-lg)', flexShrink: 0 }} aria-hidden="true">
        {icons[type] || icons.info}
      </span>
      <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onClose && onClose();
        }}
        className="icon-btn"
        style={{ padding: '4px', minWidth: '24px', minHeight: '24px' }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Toast hook for easy usage
 * Returns { show: (message, type) => void, ToastComponent }
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const show = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration, id: Date.now() });
  };

  const ToastComponent = toast ? (
    <Toast
      key={toast.id}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => setToast(null)}
      show={!!toast}
    />
  ) : null;

  return { show, ToastComponent };
}
