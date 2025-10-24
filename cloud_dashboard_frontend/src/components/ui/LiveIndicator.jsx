import React from 'react';
import '../../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * LiveIndicator
 * Small status badge indicating live socket connection status.
 *
 * Props:
 * - connected: boolean
 * - labelLive?: string (default 'Live')
 * - labelOffline?: string (default 'Offline')
 * - className?: string
 */
export default function LiveIndicator({ connected, labelLive = 'Live', labelOffline = 'Offline', className = '' }) {
  const label = connected ? labelLive : labelOffline;
  return (
    <span
      className={`live-indicator ${connected ? 'connected' : 'disconnected'} ${className}`.trim()}
      title={`Connection: ${label}`}
      aria-live="polite"
    >
      <span className={`status-dot ${connected ? 'pulse' : ''}`} aria-hidden="true" />
      <span className="status-text">{label}</span>
    </span>
  );
}
