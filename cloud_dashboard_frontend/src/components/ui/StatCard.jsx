import React from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
export default function StatCard({ title, value, subtitle, icon, loading = false }) {
  /** A small stat card block with value and subtitle. */
  const isEmpty = !loading && (value === undefined || value === null || value === '');
  return (
    <div className="card stat" style={{ background: 'var(--color-surface)' }}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon ? <span className="stat-icon">{icon}</span> : null}
      </div>
      <div className="stat-value" style={{ color: 'var(--color-text)' }}>
        {loading ? <span className="muted">...</span> : isEmpty ? <span className="muted">—</span> : value}
      </div>
      {subtitle ? <div className="stat-subtitle muted">{subtitle}</div> : null}
    </div>
  );
}
