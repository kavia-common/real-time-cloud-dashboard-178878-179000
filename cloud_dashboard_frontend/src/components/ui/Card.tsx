import React from 'react';
import '../../styles/theme.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

// PUBLIC_INTERFACE
/**
 * Ocean Professional themed card container component.
 * Provides consistent elevation, borders, and hover effects.
 */
export default function Card({ children, className = '', hoverable = false, onClick }: CardProps) {
  const classes = ['card', hoverable ? 'cursor-pointer' : '', className].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
  subtitle?: string;
}

// PUBLIC_INTERFACE
/**
 * Card header component with title and optional action button.
 */
export function CardHeader({ title, action, subtitle }: CardHeaderProps) {
  return (
    <div className="card-header">
      <div>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {subtitle && <p className="muted small" style={{ margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

// PUBLIC_INTERFACE
/**
 * Card content wrapper with consistent padding.
 */
export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`card-content ${className}`}>{children}</div>;
}
