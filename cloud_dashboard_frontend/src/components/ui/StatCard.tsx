import React from 'react';
import Sparkline from './Sparkline.tsx';
import '../../styles/theme.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  sparklineData?: number[];
}

// PUBLIC_INTERFACE
/**
 * StatCard - Enhanced stat card with trend indicators, sparklines, and delta badges
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Subtitle or helper text
 * @param {React.ReactNode} icon - Icon element
 * @param {boolean} loading - Loading state
 * @param {number} trend - Percentage change (positive/negative)
 * @param {string} trendLabel - Label for trend (e.g., "vs last week")
 * @param {string} variant - Color variant: 'default' | 'primary' | 'success' | 'warning' | 'error'
 * @param {number[]} sparklineData - Array of numbers for sparkline trend visualization
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
  sparklineData,
}: StatCardProps) {
  const isEmpty = !loading && (value === undefined || value === null || value === '');

  const variantColors = {
    default: 'var(--color-primary)',
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
  };

  const hasTrend = typeof trend === 'number' && !isNaN(trend);
  const trendUp = trend !== undefined && trend > 0;
  const trendDown = trend !== undefined && trend < 0;
  const sparklineColor = variantColors[variant];

  return (
    <div
      className={`card stat ${variant !== 'default' ? `stat-${variant}` : ''}`}
      role="region"
      aria-label={title}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && (
          <span className="stat-icon" aria-hidden="true">
            {icon}
          </span>
        )}
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

      {sparklineData && sparklineData.length > 0 && !loading && !isEmpty && (
        <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
          <Sparkline data={sparklineData} color={sparklineColor} width={100} height={20} />
        </div>
      )}

      {hasTrend && !loading && !isEmpty && (
        <div
          className={`stat-trend ${trendUp ? 'up' : trendDown ? 'down' : 'neutral'}`}
          role="status"
        >
          <span aria-hidden="true">{trendUp ? '↑' : trendDown ? '↓' : '→'}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
          {trendLabel && <span className="muted">· {trendLabel}</span>}
        </div>
      )}

      {subtitle && !loading && (
        <div className="stat-subtitle muted">{subtitle}</div>
      )}

      {loading && (
        <div
          className="skeleton"
          style={{ height: 12, marginTop: 8 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
