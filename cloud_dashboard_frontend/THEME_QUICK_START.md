# Ocean Professional Theme - Quick Start Guide

## Getting Started

The Ocean Professional theme is already integrated into the application. This guide shows you how to use the theme components in your code.

## Basic Usage

### 1. Using Buttons

```jsx
import Button from './components/ui/Button.tsx';

// Basic button
<Button variant="primary">Click Me</Button>

// Button with icon
import { FaPlus } from 'react-icons/fa';
<Button variant="primary" startIcon={<FaPlus />}>Add Item</Button>

// Loading button
<Button variant="primary" loading={isLoading}>Submit</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
```

### 2. Using Cards

```jsx
import Card, { CardHeader, CardContent } from './components/ui/Card.tsx';

<Card>
  <CardHeader 
    title="My Card" 
    subtitle="Optional subtitle"
    action={<Button variant="ghost" size="sm">Action</Button>}
  />
  <CardContent>
    <p>Your content goes here</p>
  </CardContent>
</Card>
```

### 3. Using Inputs

```jsx
import Input from './components/ui/Input.tsx';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### 4. Using Modals

```jsx
import Modal from './components/ui/Modal.tsx';
import Button from './components/ui/Button.tsx';

const [open, setOpen] = useState(false);

<Modal
  open={open}
  title="Confirm Action"
  onClose={() => setOpen(false)}
  footer={
    <>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to continue?</p>
</Modal>
```

## Using Theme Variables in CSS

You can use CSS variables anywhere in your stylesheets:

```css
.my-component {
  /* Colors */
  color: var(--color-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  
  /* Spacing */
  padding: var(--spacing-lg);
  margin: var(--spacing-md);
  gap: var(--spacing-sm);
  
  /* Border radius */
  border-radius: var(--radius-md);
  
  /* Shadows */
  box-shadow: var(--shadow-md);
  
  /* Transitions */
  transition: all var(--transition-normal);
}

.my-component:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

## Common Patterns

### Form with Validation

```jsx
import Input from './components/ui/Input.tsx';
import Button from './components/ui/Button.tsx';

const [form, setForm] = useState({ name: '', email: '' });
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  // ... validation and submission logic
  setLoading(false);
};

return (
  <form onSubmit={handleSubmit}>
    <Input
      label="Name"
      value={form.name}
      onChange={(e) => setForm({...form, name: e.target.value})}
      error={errors.name}
    />
    
    <Input
      label="Email"
      type="email"
      value={form.email}
      onChange={(e) => setForm({...form, email: e.target.value})}
      error={errors.email}
    />
    
    <Button type="submit" variant="primary" loading={loading}>
      Submit
    </Button>
  </form>
);
```

### Stat Cards Grid

```jsx
import StatCard from './components/ui/StatCard';

<div className="grid stats">
  <StatCard
    title="Total Users"
    value="1,234"
    subtitle="+12% from last month"
    icon="👥"
  />
  <StatCard
    title="Revenue"
    value="$45,231"
    subtitle="+8% from last month"
    icon="💰"
  />
</div>
```

### Confirmation Dialog

```jsx
import Modal from './components/ui/Modal.tsx';
import Button from './components/ui/Button.tsx';

const [confirmOpen, setConfirmOpen] = useState(false);

const handleDelete = () => {
  // Delete logic
  setConfirmOpen(false);
};

<Modal
  open={confirmOpen}
  title="Delete Item"
  onClose={() => setConfirmOpen(false)}
  size="sm"
  footer={
    <>
      <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
</Modal>
```

## Available CSS Utility Classes

```jsx
// Text
<p className="muted">Secondary text</p>
<p className="small">Small text</p>

// Layout
<div className="center">Centered content</div>

// Grids
<div className="grid stats">4-column responsive grid</div>
<div className="grid two">2-column grid</div>

// Badges
<span className="badge">Default</span>
<span className="badge ok">Success</span>
<span className="badge warn">Warning</span>
```

## Color Variables Reference

```css
/* Primary colors */
--color-primary: #2563EB
--color-primary-light: #3B82F6
--color-primary-dark: #1E40AF

/* Secondary colors */
--color-secondary: #F59E0B
--color-secondary-light: #FBBF24
--color-secondary-dark: #D97706

/* Semantic colors */
--color-success: #10B981
--color-error: #EF4444
--color-warning: #F59E0B
--color-info: #3B82F6

/* Backgrounds */
--color-bg: #F9FAFB
--color-surface: #FFFFFF
--color-elevated: #FFFFFF

/* Text */
--color-text: #111827
--color-text-secondary: #6B7280
--color-text-disabled: #9CA3AF
--color-text-hint: #D1D5DB

/* Borders */
--color-border: #E5E7EB
--color-border-dark: #D1D5DB
```

## Spacing Scale

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-xxl: 48px
```

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (max-width: 640px) {
  /* Mobile styles */
}

@media (max-width: 960px) {
  /* Tablet styles */
}

/* Desktop is default */
```

## Dark Mode

Dark mode is automatically handled by the ThemeContext. To toggle:

```jsx
import { useTheme } from './context/ThemeContext';

const { mode, toggleTheme } = useTheme();

<Button onClick={toggleTheme}>
  {mode === 'light' ? '🌙' : '☀️'}
</Button>
```

## Live Examples

Visit **`/ui-showcase`** in the running application to see live examples of all components and their variants.

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Import the .tsx extension** when importing TypeScript components
3. **Use semantic color names** (primary, error, success) not hex codes
4. **Leverage the spacing scale** for consistent layouts
5. **Test in both light and dark modes**
6. **Ensure keyboard accessibility** for all interactive elements

## Need Help?

- Check `/ui-showcase` for live examples
- Read `src/theme/README.md` for detailed documentation
- Review `THEME_IMPLEMENTATION.md` for implementation details
- Look at existing pages (Dashboard, Users) for usage patterns

## Common Issues

**Q: Import error for Button/Card/Input components?**  
A: Make sure to include `.tsx` extension:
```jsx
import Button from './components/ui/Button.tsx';
```

**Q: Theme variables not working?**  
A: Ensure `theme.css` is imported in your component:
```jsx
import '../styles/theme.css';
```

**Q: Dark mode not applying?**  
A: The ThemeContext should be wrapping your app in App.jsx. Check that ThemeProvider is present.
