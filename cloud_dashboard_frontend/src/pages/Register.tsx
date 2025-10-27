import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import '../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Modern registration page with enhanced visual design and smooth animations.
 */
const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.name) return 'Name is required.';
    if (!form.email) return 'Email is required.';
    if (!form.password || form.password.length < 6)
      return 'Password must be at least 6 characters.';
    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      await registerUser(form.name, form.email, form.password);
      navigate(next);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please review your input.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(249, 250, 251, 1) 100%)',
        padding: 'var(--spacing-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <div
        style={{
          background: 'var(--color-surface)',
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          width: '100%',
          maxWidth: '440px',
          border: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div
            style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-md)',
            }}
            aria-hidden="true"
          >
            ✨
          </div>
          <h1
            style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-xs)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Get Started
          </h1>
          <p className="muted" style={{ fontSize: 'var(--font-size-base)' }}>
            Create your CloudDash account
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {error && (
            <div
              role="alert"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                border: '1px solid var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}
            >
              <span aria-hidden="true">⚠️</span>
              {error}
            </div>
          )}

          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            placeholder="John Doe"
            startIcon={<span>👤</span>}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="you@example.com"
            startIcon={<span>📧</span>}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="At least 6 characters"
            helperText="Must be at least 6 characters long"
            startIcon={<span>🔒</span>}
          />

          <Button type="submit" disabled={submitting} fullWidth variant="primary" loading={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div
          style={{
            marginTop: 'var(--spacing-lg)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
          }}
        >
          <p className="muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
