# Component Quick Reference Guide

## New UI Components - Usage Examples

### Select Component
```tsx
import Select from '../components/ui/Select.tsx';

<Select
  label="Role"
  value={formData.role}
  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Regular User' },
    { value: 'guest', label: 'Guest', disabled: true }
  ]}
  error={errors.role}
  helperText="Select user role"
  size="md"
/>
```

### Tabs Component
```tsx
import Tabs from '../components/ui/Tabs.tsx';

// Segmented variant (button group)
<Tabs
  items={[
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="segmented"
  fullWidth={false}
/>

// Default variant (underline)
<Tabs
  items={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="default"
/>
```

### Tooltip Component
```tsx
import Tooltip from '../components/ui/Tooltip.tsx';

<Tooltip content="Click to edit user" position="top" delay={200}>
  <button className="icon-btn">✏️</button>
</Tooltip>

<Tooltip content="Delete this item" position="bottom">
  <button className="btn danger">Delete</button>
</Tooltip>
```

### Toast Component
```tsx
import Toast from '../components/ui/Toast.tsx';

const [toast, setToast] = useState(null);

// Show toast
setToast({
  message: 'User created successfully',
  type: 'success',
  duration: 3000
});

// Render toast
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    duration={toast.duration}
    position="bottom-right"
    onClose={() => setToast(null)}
  />
)}
```

### Sparkline Component
```tsx
import Sparkline from '../components/ui/Sparkline.tsx';

<Sparkline
  data={[45, 52, 48, 63, 71, 68, 75]}
  width={100}
  height={24}
  color="var(--color-primary)"
  showDots={false}
/>
```

### Enhanced StatCard
```tsx
import StatCard from '../components/ui/StatCard.tsx';

<StatCard
  title="Total Revenue"
  value="$45,231"
  subtitle="Last 30 days"
  icon="💰"
  trend={15.3}
  trendLabel="vs last month"
  sparklineData={[100, 120, 115, 130, 145, 150, 160]}
  variant="success"
  loading={false}
/>
```

## Enhanced Existing Components

### Button with Loading
```tsx
import Button from '../components/ui/Button.tsx';

<Button
  variant="primary"
  size="md"
  loading={isSubmitting}
  disabled={!isValid}
  fullWidth
  onClick={handleSubmit}
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

### Input with Icons
```tsx
import Input from '../components/ui/Input.tsx';

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  startIcon={<span>📧</span>}
  error={emailError}
  helperText="We'll never share your email"
/>

<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  startIcon={<span>🔒</span>}
  endIcon={<button onClick={toggleShow}>👁️</button>}
/>
```

### Card with Header
```tsx
import Card, { CardHeader, CardContent } from '../components/ui/Card.tsx';

<Card>
  <CardHeader
    title="User Details"
    subtitle="Manage user information"
    action={<Button variant="ghost">Edit</Button>}
  />
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>
```

## CSS Variable Usage

### Colors
```css
/* Primary */
color: var(--color-primary);
background: var(--color-primary-alpha-10);

/* Semantic */
color: var(--color-success);
border-color: var(--color-error);

/* Text */
color: var(--color-text);
color: var(--color-text-secondary);
color: var(--color-text-muted);
```

### Spacing
```css
padding: var(--spacing-md);
gap: var(--spacing-sm);
margin-bottom: var(--spacing-lg);
```

### Shadows
```css
box-shadow: var(--shadow-sm);   /* Subtle */
box-shadow: var(--shadow-md);   /* Cards */
box-shadow: var(--shadow-lg);   /* Elevated */
box-shadow: var(--shadow-xl);   /* Modals */
```

### Border Radius
```css
border-radius: var(--radius-sm);   /* Inputs */
border-radius: var(--radius-md);   /* Buttons */
border-radius: var(--radius-lg);   /* Cards */
border-radius: var(--radius-full); /* Pills */
```

### Typography
```css
font-size: var(--font-size-sm);
font-weight: var(--font-weight-semibold);
```

## Common Patterns

### Empty State
```tsx
<div className="empty-state center" style={{
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-xl)',
  textAlign: 'center'
}}>
  <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>📋</div>
  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
    No data available
  </div>
  <div className="muted small">
    Data will appear here when available
  </div>
</div>
```

### Loading State
```tsx
<div className="skeleton" style={{ height: 80, marginBottom: 8 }} />
<div className="skeleton" style={{ height: 60, marginBottom: 8 }} />
<div className="skeleton" style={{ height: 40 }} />
```

### Badge
```tsx
<span className="badge ok">Active</span>
<span className="badge warn">Pending</span>
<span className="badge error">Failed</span>
```

### Icon Button
```tsx
<button className="icon-btn" aria-label="Edit">
  ✏️
</button>
```

## Accessibility Best Practices

### ARIA Labels
```tsx
<button aria-label="Close modal" onClick={onClose}>
  ✕
</button>

<div role="region" aria-label="Statistics">
  {/* Stats content */}
</div>
```

### Live Regions
```tsx
<div aria-live="polite" role="status">
  {message}
</div>
```

### Focus Management
```tsx
<input
  ref={inputRef}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
  aria-describedby="input-helper"
/>
```

## Responsive Patterns

### Mobile First Grid
```tsx
<div className="grid stats">
  {/* Auto-responsive grid: 4→2→1 columns */}
</div>
```

### Conditional Rendering
```tsx
<button className="mobile-only">☰</button>
<nav className="desktop-only">...</nav>
```

## Theme Integration

### Using Theme Context
```tsx
import { useTheme } from '../context/ThemeContext';

const { mode, toggleTheme } = useTheme();

<button onClick={toggleTheme}>
  {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
</button>
```

### Dark Mode Styles
```css
/* Light mode (default) */
.card {
  background: var(--color-surface);
}

/* Dark mode (automatic via CSS variables) */
[data-theme="dark"] .card {
  /* Variables automatically update */
}
```

## Animation Classes

### Built-in Animations
```tsx
<div className="animate-spin">⚙️</div>

<div style={{
  animation: 'fadeIn 200ms ease-out'
}}>
  Fading in...
</div>

<div style={{
  animation: 'slideUp 300ms ease-out'
}}>
  Sliding up...
</div>
```

## Form Validation Pattern

```tsx
const [form, setForm] = useState({ email: '', password: '' });
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!form.email) newErrors.email = 'Email is required';
  if (!form.password) newErrors.password = 'Password is required';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  // Submit form
};

return (
  <form onSubmit={handleSubmit}>
    <Input
      label="Email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      error={errors.email}
    />
    <Button type="submit">Submit</Button>
  </form>
);
```

## WebSocket Integration Pattern

```tsx
import useSocket from '../hooks/useSocket';
import LiveIndicator from '../components/ui/LiveIndicator';

const { connected, subscribe } = useSocket('/metrics');

useEffect(() => {
  const unsubscribe = subscribe('event-name', (data) => {
    console.log('Received:', data);
    // Update state
  });
  return unsubscribe;
}, [subscribe]);

// Show connection status
<LiveIndicator
  connected={connected}
  labelLive="Live"
  labelOffline="Disconnected"
/>
```

## Tips & Tricks

### 1. Consistent Spacing
Use spacing variables instead of hard-coded values:
```css
/* ❌ Avoid */
padding: 16px;

/* ✅ Prefer */
padding: var(--spacing-md);
```

### 2. Color Usage
Use semantic colors when possible:
```css
/* ❌ Avoid */
color: #EF4444;

/* ✅ Prefer */
color: var(--color-error);
```

### 3. Focus States
Always style focus states for keyboard users:
```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 4. Transitions
Keep transitions smooth and consistent:
```css
transition: all var(--transition-fast); /* 150ms */
transition: all var(--transition-normal); /* 250ms */
```

### 5. Mobile Touch Targets
Ensure buttons are at least 44x44px for touch:
```css
min-width: 44px;
min-height: 44px;
```
