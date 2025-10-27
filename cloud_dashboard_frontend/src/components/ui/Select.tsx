import React from 'react';
import '../../styles/theme.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
}

// PUBLIC_INTERFACE
/**
 * Ocean Professional themed select component with label, error, and helper text support.
 */
export default function Select({
  label,
  error,
  helperText,
  fullWidth = true,
  options,
  size = 'md',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <div className={`select-wrapper ${fullWidth ? 'w-full' : ''}`} style={{ marginBottom: 'var(--spacing-md)' }}>
      {label && (
        <label htmlFor={selectId} style={{ marginBottom: 'var(--spacing-xs)', display: 'block' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          className={`${sizeClasses[size]} ${className} ${hasError ? 'border-error' : ''}`}
          style={{
            width: fullWidth ? '100%' : undefined,
            borderColor: hasError ? 'var(--color-error)' : undefined,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '40px',
          }}
          aria-invalid={hasError}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p
          id={`${selectId}-error`}
          className="small"
          style={{ color: 'var(--color-error)', marginTop: 'var(--spacing-xs)' }}
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={`${selectId}-helper`}
          className="small muted"
          style={{ marginTop: 'var(--spacing-xs)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
