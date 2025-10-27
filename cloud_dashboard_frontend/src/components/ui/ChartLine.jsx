import React, { useMemo } from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
export default function ChartLine({ data = [], height = 180, color = 'var(--color-primary)', title = 'Series', loading = false }) {
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
    const viewH = 200;
    const mapX = (x) => ((x - minX) / (maxX - minX || 1)) * width;
    const mapY = (y) => viewH - ((y - minY) / (maxY - minY || 1)) * viewH;
    const pts = data.map((d) => `${mapX(d.x)},${mapY(d.y)}`).join(' ');
    return { points: pts, minY, maxY };
  }, [data]);

  const isEmpty = !loading && (!data || data.length === 0);

  return (
    <div className="card chart">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>{title}</span>
        <span className="muted">Min {Number(minY).toFixed(0)} | Max {Number(maxY).toFixed(0)}</span>
      </div>
      <div style={{ position: 'relative' }}>
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

        {loading && (
          <div className="center small muted" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading series...
          </div>
        )}
        {isEmpty && (
          <div className="center small muted" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No data
          </div>
        )}
      </div>
    </div>
  );
}
