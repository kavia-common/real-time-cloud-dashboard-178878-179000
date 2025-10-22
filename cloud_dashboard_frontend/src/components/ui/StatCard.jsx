import React from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
export default function StatCard({ title, value, subtitle, icon }) {
  /** A small stat card block with value and subtitle. */
  return (
    <div className="card stat">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon ? <span className="stat-icon">{icon}</span> : null}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle ? <div className="stat-subtitle">{subtitle}</div> : null}
    </div>
  );
}
