import React, { useMemo } from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
export default function ChartLine({ data = [], height = 180, color = 'var(--color-primary)', title = 'Series' }) {
  /**
   * Lightweight SVG line chart to avoid adding chart libs now.
   * Expects [{x, y}] normalized or arbitrary values; we normalize to fit viewBox.
   * Keeps re-render cost low by memoizing path points.
   */
  const { points, minY, maxY } = useMemo(() => {
    if (!data.length) return { points: '', minY: 0, maxY: 0 };
    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = 600;
    const height = 200;
    const mapX = (x) => ((x - minX) / (maxX - minX || 1)) * width;
    const mapY = (y) => height - ((y - minY) / (maxY - minY || 1)) * height;
    const pts = data.map((d) => `${mapX(d.x)},${mapY(d.y)}`).join(' ');
    return { points: pts, minY, maxY };
  }, [data]);

  return (
    <div className="card chart">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>{title}</span>
        <span className="muted">Min {Number(minY).toFixed(0)} | Max {Number(maxY).toFixed(0)}</span>
      </div>
      <svg viewBox="0 0 600 200" height={height} width="100%">
        <defs>
          <linearGradient id="oceanArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
