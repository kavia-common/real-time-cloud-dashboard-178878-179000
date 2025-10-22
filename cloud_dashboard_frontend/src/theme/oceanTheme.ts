/**
 * Ocean Professional Theme Configuration
 * Defines colors, spacing, shadows, radius, and typography tokens
 */

export const oceanTheme = {
  colors: {
    // Primary palette
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF',
      contrast: '#FFFFFF',
    },
    // Secondary palette
    secondary: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrast: '#FFFFFF',
    },
    // Success
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrast: '#FFFFFF',
    },
    // Error
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrast: '#FFFFFF',
    },
    // Warning
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrast: '#FFFFFF',
    },
    // Background
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
      elevated: '#FFFFFF',
      gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(249, 250, 251, 1) 100%)',
    },
    // Text
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      hint: '#D1D5DB',
    },
    // Borders
    border: {
      light: '#E5E7EB',
      main: '#D1D5DB',
      dark: '#9CA3AF',
    },
  },
  
  // Spacing scale (in px)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  radius: {
    sm: '6px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 10px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.10)',
  },
  
  // Typography
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export type OceanTheme = typeof oceanTheme;

export default oceanTheme;
