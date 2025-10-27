import React, { useMemo } from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
}

// PUBLIC_INTERFACE
/**
 * Sparkline - Minimal inline chart for showing trends.
 * Used in StatCard to display historical data trends.
 */
export default function Sparkline({
  data = [],
  width = 80,
  height = 24,
  color = 'var(--color-primary)',
  showDots = false,
}: SparklineProps) {
  const pathData = useMemo(() => {
    if (data.length === 0) return '';

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }, [data, width, height]);

  const dotPositions = useMemo(() => {
    if (!showDots || data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return data.map((val, i) => ({
      x: (i / (data.length - 1 || 1)) * width,
      y: height - ((val - min) / range) * height,
    }));
  }, [data, width, height, showDots]);

  if (data.length === 0) {
    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block' }}
      role="img"
      aria-label="Trend sparkline"
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ transition: 'all var(--transition-fast)' }}
      />
      {showDots &&
        dotPositions.map((pos, i) => (
          <circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r="2"
            fill={color}
            style={{ transition: 'all var(--transition-fast)' }}
          />
        ))}
    </svg>
  );
}
