# Ocean Professional Theme

## Overview

The Ocean Professional theme provides a modern, polished design system for the Cloud Dashboard application. It features a blue and amber color palette with subtle gradients, consistent spacing, smooth transitions, and comprehensive component styling.

## Theme Configuration

### Colors

**Primary (Blue)**
- Main: `#2563EB`
- Light: `#3B82F6`
- Dark: `#1E40AF`

**Secondary (Amber)**
- Main: `#F59E0B`
- Light: `#FBBF24`
- Dark: `#D97706`

**Semantic Colors**
- Success: `#10B981`
- Error: `#EF4444`
- Warning: `#F59E0B`
- Info: `#3B82F6`

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Border Radius
- sm: 6px
- md: 10px
- lg: 12px
- xl: 16px
- full: 9999px

### Shadows
- sm: `0 1px 2px rgba(0, 0, 0, 0.05)`
- md: `0 4px 10px rgba(0, 0, 0, 0.06)`
- lg: `0 10px 25px rgba(0, 0, 0, 0.08)`
- xl: `0 20px 40px rgba(0, 0, 0, 0.10)`

## Using Theme Variables

### CSS Variables

All theme tokens are available as CSS variables:

```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}
```

### TypeScript Theme Object

Import the theme object for programmatic access:

```typescript
import oceanTheme from '../theme/oceanTheme';

const MyComponent = () => (
  <div style={{ 
    color: oceanTheme.colors.primary.main,
    padding: oceanTheme.spacing.md 
  }}>
    Content
  </div>
);
```

## UI Components

### Button

```jsx
import Button from '../components/ui/Button';

<Button variant="primary" size="md">Click Me</Button>
<Button variant="ghost" loading={true}>Loading...</Button>
<Button variant="danger" startIcon={<TrashIcon />}>Delete</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `loading`: boolean
- `startIcon`, `endIcon`: React.ReactNode

### Card

```jsx
import Card, { CardHeader, CardContent } from '../components/ui/Card';

<Card>
  <CardHeader title="Dashboard" subtitle="Overview" />
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### Input

```jsx
import Input from '../components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Modal

```jsx
import Modal from '../components/ui/Modal';

<Modal
  open={isOpen}
  title="Confirm Action"
  onClose={() => setIsOpen(false)}
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

## Chart Theming

### Using Chart Theme

```typescript
import { chartColors, chartJsTheme, rechartsTheme } from '../components/charts/ChartTheme';

// For Chart.js
import { Chart } from 'chart.js';
Chart.defaults.set(chartJsTheme);

// For Recharts
<LineChart data={data}>
  <CartesianGrid {...rechartsTheme.cartesianGrid} />
  <XAxis {...rechartsTheme.xAxis} />
  <YAxis {...rechartsTheme.yAxis} />
  <Tooltip {...rechartsTheme.tooltip} />
  <Line stroke={chartColors.primary} />
</LineChart>
```

## Dark Mode

The theme supports dark mode via the `data-theme` attribute:

```jsx
// In ThemeContext
document.documentElement.setAttribute('data-theme', 'dark');
```

Dark mode automatically adjusts:
- Background colors
- Surface colors
- Text colors
- Border colors
- Shadow intensity

## Responsive Design

The theme includes responsive breakpoints:

- Mobile: < 640px
- Tablet: < 960px
- Desktop: ≥ 960px

Layout automatically adapts:
- Sidebar collapses to drawer on mobile
- Grid layouts adjust column count
- Spacing scales down on smaller screens

## Accessibility

All components follow accessibility best practices:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus visible indicators
- Color contrast ratios meet WCAG AA standards
- Reduced motion support for animations

## Best Practices

1. **Use CSS variables** for consistent theming
2. **Import theme.css** in your component files
3. **Use semantic color names** (primary, error, success) over hex codes
4. **Leverage utility classes** for common patterns
5. **Test in both light and dark modes**
6. **Ensure keyboard accessibility** for interactive elements
7. **Use consistent spacing** from the spacing scale

## Extending the Theme

To add custom styles while maintaining consistency:

```css
/* In your component CSS */
.my-custom-component {
  /* Use existing variables */
  background: var(--color-surface);
  padding: var(--spacing-lg);
  
  /* Add custom properties if needed */
  --my-custom-color: #custom-value;
}
```

## Migration Guide

If migrating existing components:

1. Replace inline colors with CSS variables
2. Replace Button JSX with `<Button>` component
3. Wrap content in `<Card>` components
4. Update input fields to use `<Input>` component
5. Replace custom modals with `<Modal>` component
6. Apply chart theme tokens to visualizations

## Support

For questions or issues with the theme:
- Check this documentation
- Review component source files in `src/components/ui/`
- Consult the theme configuration in `src/theme/oceanTheme.ts`
