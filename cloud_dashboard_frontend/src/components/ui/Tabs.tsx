import React from 'react';
import '../../styles/theme.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'segmented';
  fullWidth?: boolean;
}

// PUBLIC_INTERFACE
/**
 * Tabs component with support for default and segmented control variants.
 * Includes keyboard navigation (arrow keys) and proper ARIA attributes.
 */
export default function Tabs({
  items,
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
}: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % items.length;
      const nextItem = items[nextIndex];
      if (!nextItem.disabled) {
        onChange(nextItem.id);
      }
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + items.length) % items.length;
      const prevItem = items[prevIndex];
      if (!prevItem.disabled) {
        onChange(prevItem.id);
      }
    }
  };

  if (variant === 'segmented') {
    return (
      <div
        className="tabs-segmented"
        role="tablist"
        style={{
          display: 'inline-flex',
          background: 'var(--color-bg-alt)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          gap: '4px',
          width: fullWidth ? '100%' : undefined,
        }}
      >
        {items.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !item.disabled && onChange(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={item.disabled}
              className="tab-segmented-item"
              style={{
                flex: fullWidth ? 1 : undefined,
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--color-surface)' : 'transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                fontSize: 'var(--font-size-sm)',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="tabs-default"
      role="tablist"
      style={{
        display: 'flex',
        borderBottom: '2px solid var(--color-border)',
        gap: 'var(--spacing-sm)',
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {items.map((item, index) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={item.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => !item.disabled && onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={item.disabled}
            className="tab-default-item"
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              border: 'none',
              background: 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-sm)',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              borderBottom: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
