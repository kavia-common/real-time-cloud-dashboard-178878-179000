/**
 * Ocean Professional Chart Theme
 * Provides consistent color palette and styling for chart libraries (Chart.js, Recharts, etc.)
 */

export const chartColors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',
  secondary: '#F59E0B',
  secondaryLight: '#FBBF24',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Gradient colors for multi-series charts
  series: [
    '#2563EB', // Blue
    '#F59E0B', // Amber
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
  ],
  
  // Background colors for chart areas
  backgroundLight: 'rgba(37, 99, 235, 0.05)',
  backgroundGradient: 'linear-gradient(180deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.01) 100%)',
  
  // Grid and axis colors
  gridColor: '#E5E7EB',
  axisColor: '#6B7280',
  
  // Text colors
  labelColor: '#6B7280',
  titleColor: '#111827',
};

/**
 * Chart.js theme configuration
 * Use with Chart.js defaults to apply Ocean Professional styling
 */
export const chartJsTheme = {
  plugins: {
    legend: {
      labels: {
        color: chartColors.labelColor,
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          weight: '500',
        },
        padding: 16,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      titleColor: chartColors.titleColor,
      bodyColor: chartColors.labelColor,
      borderColor: chartColors.gridColor,
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      titleFont: {
        family: 'Inter, sans-serif',
        size: 13,
        weight: '600',
      },
      bodyFont: {
        family: 'Inter, sans-serif',
        size: 12,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: chartColors.gridColor,
        borderColor: chartColors.gridColor,
      },
      ticks: {
        color: chartColors.labelColor,
        font: {
          family: 'Inter, sans-serif',
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: chartColors.gridColor,
        borderColor: chartColors.gridColor,
      },
      ticks: {
        color: chartColors.labelColor,
        font: {
          family: 'Inter, sans-serif',
          size: 11,
        },
      },
    },
  },
};

/**
 * Recharts theme configuration
 * Use with Recharts components for Ocean Professional styling
 */
export const rechartsTheme = {
  colors: chartColors.series,
  stroke: chartColors.primary,
  fill: chartColors.primary,
  cartesianGrid: {
    stroke: chartColors.gridColor,
    strokeDasharray: '3 3',
  },
  xAxis: {
    stroke: chartColors.gridColor,
    tick: { fill: chartColors.labelColor, fontSize: 11, fontFamily: 'Inter, sans-serif' },
  },
  yAxis: {
    stroke: chartColors.gridColor,
    tick: { fill: chartColors.labelColor, fontSize: 11, fontFamily: 'Inter, sans-serif' },
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFFF',
      border: `1px solid ${chartColors.gridColor}`,
      borderRadius: '10px',
      padding: '12px',
      fontFamily: 'Inter, sans-serif',
    },
    labelStyle: {
      color: chartColors.titleColor,
      fontWeight: 600,
      marginBottom: '6px',
    },
  },
  legend: {
    iconType: 'circle',
    wrapperStyle: {
      paddingTop: '16px',
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: chartColors.labelColor,
    },
  },
};

export default {
  colors: chartColors,
  chartJs: chartJsTheme,
  recharts: rechartsTheme,
};
