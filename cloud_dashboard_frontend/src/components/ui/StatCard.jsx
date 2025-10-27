import React from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
/**
 * StatCard - Enhanced stat card with trend indicators and delta badges
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Subtitle or helper text
 * @param {React.ReactNode} icon - Icon element
 * @param {boolean} loading - Loading state
 * @param {number} trend - Percentage change (positive/negative)
 * @param {string} trendLabel - Label for trend (e.g., "vs last week")
 * @param {string} variant - Color variant: 'default' | 'primary' | 'success' | 'warning' | 'error'
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  loading = false,
  trend,
  trendLabel,
  variant = 'default',
}) {
  const isEmpty = !loading && (value === undefined || value === null || value === '');

  const variantClasses = {
    default: '',
    primary: 'stat-primary',
    success: 'stat-success',
    warning: 'stat-warning',
    error: 'stat-error',
  };

  const hasTrend = typeof trend === 'number' && !isNaN(trend);
  const trendUp = trend > 0;
  const trendDown = trend < 0;

  return (
    <div className={`card stat ${variantClasses[variant] || ''}`} role="region" aria-label={title}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && <span className="stat-icon" aria-hidden="true">{icon}</span>}
      </div>

      <div className="stat-value">
        {loading ? (
          <span className="muted">...</span>
        ) : isEmpty ? (
          <span className="muted">—</span>
        ) : (
          value
        )}
      </div>

      {hasTrend && !loading && !isEmpty && (
        <div className={`stat-trend ${trendUp ? 'up' : trendDown ? 'down' : 'neutral'}`} role="status">
          <span aria-hidden="true">{trendUp ? '↑' : trendDown ? '↓' : '→'}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="muted">· {trendLabel}</span>}
        </div>
      )}

      {subtitle && !loading && (
        <div className="stat-subtitle muted">{subtitle}</div>
      )}

      {loading && (
        <div className="skeleton" style={{ height: 12, marginTop: 8 }} aria-hidden="true" />
      )}
    </div>
  );
}
