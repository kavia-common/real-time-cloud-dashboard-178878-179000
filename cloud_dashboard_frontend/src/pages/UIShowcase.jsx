import React, { useState } from 'react';
import Button from '../components/ui/Button.tsx';
import Card, { CardHeader, CardContent } from '../components/ui/Card.tsx';
import Input from '../components/ui/Input.tsx';
import Modal from '../components/ui/Modal.tsx';
import StatCard from '../components/ui/StatCard';
import { FaSearch, FaUser, FaCheck, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/theme.css';

/**
 * UI Showcase page demonstrating Ocean Professional theme components.
 * For development and documentation purposes.
 */
export default function UIShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Form submitted!');
    }, 2000);
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>Ocean Professional UI Showcase</h1>
        <p className="muted">
          Demonstration of all available components with the Ocean Professional theme
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader title="Buttons" subtitle="Various button styles and states" />
        <CardContent>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <Button variant="primary" startIcon={<FaPlus />}>
              With Start Icon
            </Button>
            <Button variant="danger" endIcon={<FaTrash />} style={{ marginLeft: 'var(--spacing-md)' }}>
              With End Icon
            </Button>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <Button variant="primary" fullWidth>
              Full Width Button
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card style={{ marginTop: 'var(--spacing-lg)' }}>
        <CardHeader title="Form Inputs" subtitle="Text inputs with labels, errors, and icons" />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText="This is a helper text"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              startIcon={<FaUser />}
              error={errors.email}
            />

            <Input
              label="Search"
              type="text"
              placeholder="Search..."
              startIcon={<FaSearch />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              helperText="Must be at least 8 characters"
            />

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
              <Button type="submit" variant="primary" loading={loading}>
                Submit Form
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFormData({ email: '', password: '', name: '' })}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <div className="grid stats" style={{ marginTop: 'var(--spacing-lg)' }}>
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
        <StatCard
          title="Active Sessions"
          value="892"
          subtitle="Live now"
          icon="🔥"
        />
        <StatCard
          title="Performance"
          value="98.5%"
          subtitle="System uptime"
          icon="⚡"
        />
      </div>

      {/* Modal Section */}
      <Card style={{ marginTop: 'var(--spacing-lg)' }}>
        <CardHeader title="Modals" subtitle="Dialog components with backdrop" />
        <CardContent>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Modal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card style={{ marginTop: 'var(--spacing-lg)' }}>
        <CardHeader title="Color Palette" subtitle="Ocean Professional color system" />
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-md)' }}>
            <ColorSwatch color="var(--color-primary)" label="Primary" />
            <ColorSwatch color="var(--color-secondary)" label="Secondary" />
            <ColorSwatch color="var(--color-success)" label="Success" />
            <ColorSwatch color="var(--color-error)" label="Error" />
            <ColorSwatch color="var(--color-warning)" label="Warning" />
            <ColorSwatch color="var(--color-info)" label="Info" />
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card style={{ marginTop: 'var(--spacing-lg)' }}>
        <CardHeader title="Typography" subtitle="Text styles and hierarchy" />
        <CardContent>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
          <p>Regular paragraph text with normal weight and size.</p>
          <p className="muted">Muted text for secondary information.</p>
          <p className="small">Small text for captions and labels.</p>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card style={{ marginTop: 'var(--spacing-lg)' }}>
        <CardHeader title="Badges" subtitle="Status indicators and labels" />
        <CardContent>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <span className="badge">Default</span>
            <span className="badge ok">Success</span>
            <span className="badge warn">Warning</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Component */}
      <Modal
        open={modalOpen}
        title="Example Modal"
        onClose={() => setModalOpen(false)}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" startIcon={<FaCheck />} onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p>This is an example modal dialog with the Ocean Professional theme.</p>
        <p className="muted" style={{ marginTop: 'var(--spacing-md)' }}>
          It features a clean design, smooth animations, and responsive behavior.
          You can close it by clicking the X button, pressing Escape, or clicking outside.
        </p>
      </Modal>
    </div>
  );
}

// Helper component for color swatches
function ColorSwatch({ color, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '100%',
          height: '80px',
          backgroundColor: color,
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-sm)',
          boxShadow: 'var(--shadow-md)',
        }}
      />
      <span className="small">{label}</span>
    </div>
  );
}
