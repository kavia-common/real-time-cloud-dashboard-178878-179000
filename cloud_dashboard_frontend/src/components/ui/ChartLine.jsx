import React, { useMemo } from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
export default function ChartLine({ data = [], height = 180, color = 'var(--color-primary)' }) {
  /**
   * Lightweight SVG line chart to avoid adding chart libs now.
   * Expects [{x, y}] normalized or arbitrary values; we normalize to fit viewBox.
   */
  const { points, minX, maxX, minY, maxY } = useMemo(() => {
    if (!data.length) return { points: '', minX: 0, maxX: 1, minY: 0, maxY: 1 };
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
    return { points: pts, minX, maxX, minY, maxY };
  }, [data]);

  return (
    <div className="card chart">
      <div className="chart-header">
        <span>Traffic (mock)</span>
        <span className="muted">Min {minY} | Max {maxY}</span>
      </div>
      <svg viewBox="0 0 600 200" height={height} width="100%">
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
