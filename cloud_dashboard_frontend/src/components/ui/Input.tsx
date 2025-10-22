import React from 'react';
import '../../styles/theme.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// PUBLIC_INTERFACE
/**
 * Ocean Professional themed input component with label, error, and helper text support.
 */
export default function Input({
  label,
  error,
  helperText,
  fullWidth = true,
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={`input-wrapper ${fullWidth ? 'w-full' : ''}`} style={{ marginBottom: 'var(--spacing-md)' }}>
      {label && (
        <label htmlFor={inputId} style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {startIcon && (
          <span style={{
            position: 'absolute',
            left: 'var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-secondary)',
          }}>
            {startIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`${className} ${hasError ? 'border-error' : ''}`}
          style={{
            paddingLeft: startIcon ? 'calc(var(--spacing-xl) + var(--spacing-md))' : undefined,
            paddingRight: endIcon ? 'calc(var(--spacing-xl) + var(--spacing-md))' : undefined,
            borderColor: hasError ? 'var(--color-error)' : undefined,
          }}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {endIcon && (
          <span style={{
            position: 'absolute',
            right: 'var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-secondary)',
          }}>
            {endIcon}
          </span>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="small"
          style={{ color: 'var(--color-error)', marginTop: 'var(--spacing-xs)' }}
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className="small muted"
          style={{ marginTop: 'var(--spacing-xs)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
