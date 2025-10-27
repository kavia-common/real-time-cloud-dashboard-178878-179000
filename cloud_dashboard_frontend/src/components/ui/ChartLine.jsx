import React, { useMemo } from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
/**
 * ChartLine - Sleek SVG line chart with gradient, grid, and axis
 * @param {Array} data - Array of {x, y} points
 * @param {number} height - Chart height in pixels
 * @param {string} color - Line stroke color
 * @param {string} title - Chart title
 * @param {boolean} loading - Loading state
 * @param {boolean} showGrid - Show grid lines
 * @param {boolean} showGradient - Show gradient fill under line
 */
export default function ChartLine({
  data = [],
  height = 180,
  color = 'var(--color-primary)',
  title = 'Series',
  loading = false,
  showGrid = true,
  showGradient = true,
}) {
  const { points, areaPath, minY, maxY, isEmpty } = useMemo(() => {
    if (!data.length) return { points: '', areaPath: '', minY: 0, maxY: 0, isEmpty: true };

    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = 600;
    const viewH = 200;
    const padding = 10;

    const mapX = (x) => padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding);
    const mapY = (y) => viewH - padding - ((y - minY) / (maxY - minY || 1)) * (viewH - 2 * padding);

    const pts = data.map((d) => `${mapX(d.x)},${mapY(d.y)}`).join(' ');

    // Area path for gradient fill
    let areaPath = '';
    if (data.length > 0) {
      const firstX = mapX(data[0].x);
      const lastX = mapX(data[data.length - 1].x);
      areaPath = `M${firstX},${viewH - padding} `;
      areaPath += data.map((d) => `L${mapX(d.x)},${mapY(d.y)}`).join(' ');
      areaPath += ` L${lastX},${viewH - padding} Z`;
    }

    return { points: pts, areaPath, minY, maxY, isEmpty: false };
  }, [data]);

  const formattedMin = useMemo(() => Number(minY).toFixed(1), [minY]);
  const formattedMax = useMemo(() => Number(maxY).toFixed(1), [maxY]);

  return (
    <div className="card chart" style={{ overflow: 'hidden' }}>
      <div
        className="chart-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.02) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
          {title}
        </span>
        {!isEmpty && !loading && (
          <span className="muted small">
            Min: {formattedMin} | Max: {formattedMax}
          </span>
        )}
      </div>

      <div className="chart-body" style={{ position: 'relative', padding: 'var(--spacing-md)' }}>
        <svg
          viewBox="0 0 600 200"
          height={height}
          width="100%"
          style={{ display: 'block' }}
          role="img"
          aria-label={`Line chart: ${title}`}
        >
          <defs>
            <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {showGrid && !isEmpty && (
            <g className="grid" opacity="0.15">
              {[...Array(5)].map((_, i) => {
                const y = 10 + (i * 180) / 4;
                return (
                  <line
                    key={`grid-h-${i}`}
                    x1="10"
                    y1={y}
                    x2="590"
                    y2={y}
                    stroke="var(--color-border-dark)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}
              {[...Array(5)].map((_, i) => {
                const x = 10 + (i * 580) / 4;
                return (
                  <line
                    key={`grid-v-${i}`}
                    x1={x}
                    y1="10"
                    x2={x}
                    y2="190"
                    stroke="var(--color-border-dark)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </g>
          )}

          {/* Gradient area fill */}
          {showGradient && !isEmpty && areaPath && (
            <path d={areaPath} fill="url(#oceanGradient)" />
          )}

          {/* Line path */}
          {!isEmpty && points && (
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              points={points}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#glow)"
              style={{ transition: 'all 0.3s ease' }}
            />
          )}

          {/* Data points */}
          {!isEmpty && data.length > 0 && data.length < 50 && (
            <g className="data-points">
              {data.map((d, i) => {
                const xs = data.map((d) => d.x);
                const ys = data.map((d) => d.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                const mapX = (x) => 10 + ((x - minX) / (maxX - minX || 1)) * 580;
                const mapY = (y) => 190 - ((y - minY) / (maxY - minY || 1)) * 180;

                return (
                  <circle
                    key={`point-${i}`}
                    cx={mapX(d.x)}
                    cy={mapY(d.y)}
                    r="4"
                    fill={color}
                    stroke="var(--color-surface)"
                    strokeWidth="2"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <title>{`Point ${i + 1}: ${d.y}`}</title>
                  </circle>
                );
              })}
            </g>
          )}
        </svg>

        {/* Loading state */}
        {loading && (
          <div
            className="center small muted"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
            }}
            role="status"
            aria-live="polite"
          >
            <div className="skeleton" style={{ width: '60%', height: 12 }} />
            <div className="skeleton" style={{ width: '40%', height: 8 }} />
            Loading chart data...
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !loading && (
          <div
            className="center small muted"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-xs)',
            }}
            role="status"
          >
            <span style={{ fontSize: '2rem', opacity: 0.5 }} aria-hidden="true">
              📊
            </span>
            <span>No data available</span>
          </div>
        )}
      </div>
    </div>
  );
}
