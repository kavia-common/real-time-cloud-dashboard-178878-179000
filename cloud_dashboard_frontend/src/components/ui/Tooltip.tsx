import React, { useState } from 'react';
import '../../styles/theme.css';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

// PUBLIC_INTERFACE
/**
 * Tooltip component that shows on hover with configurable position and delay.
 * Respects prefers-reduced-motion for accessibility.
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setShow(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setShow(false);
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-8px)',
      marginBottom: '4px',
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(8px)',
      marginTop: '4px',
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(-8px)',
      marginRight: '4px',
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(8px)',
      marginLeft: '4px',
    },
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 'var(--z-tooltip)',
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'fadeIn 150ms ease-out',
            ...positionStyles[position],
          }}
        >
          {content}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(position === 'top' && {
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '5px 5px 0 5px',
                borderColor: 'var(--color-border) transparent transparent transparent',
              }),
              ...(position === 'bottom' && {
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 5px 5px 5px',
                borderColor: 'transparent transparent var(--color-border) transparent',
              }),
              ...(position === 'left' && {
                right: '-5px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '5px 0 5px 5px',
                borderColor: 'transparent transparent transparent var(--color-border)',
              }),
              ...(position === 'right' && {
                left: '-5px',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '5px 5px 5px 0',
                borderColor: 'transparent var(--color-border) transparent transparent',
              }),
            }}
          />
        </div>
      )}
    </div>
  );
}
