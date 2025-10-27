import React, { useEffect } from 'react';
import '../../styles/theme.css';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// PUBLIC_INTERFACE
/**
 * Toast notification component with auto-dismiss and configurable positioning.
 * Includes proper ARIA attributes for screen readers.
 */
export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'bottom-right',
}: ToastProps) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    info: {
      borderColor: 'var(--color-primary)',
      icon: 'ℹ️',
    },
    success: {
      borderColor: 'var(--color-success)',
      icon: '✅',
    },
    warning: {
      borderColor: 'var(--color-warning)',
      icon: '⚠️',
    },
    error: {
      borderColor: 'var(--color-error)',
      icon: '❌',
    },
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: '16px', right: '16px' },
    'top-left': { top: '16px', left: '16px' },
    'bottom-right': { bottom: '16px', right: '16px' },
    'bottom-left': { bottom: '16px', left: '16px' },
  };

  const style = typeStyles[type];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 'var(--z-toast)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${style.borderColor}`,
        minWidth: '280px',
        maxWidth: '420px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        animation: 'slideIn 200ms ease-out',
      }}
    >
      <span style={{ fontSize: 'var(--font-size-lg)' }} aria-hidden="true">
        {style.icon}
      </span>
      <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: 'var(--font-size-base)',
            lineHeight: 1,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          ✕
        </button>
      )}
    </div>
  );
}
