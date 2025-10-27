import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

/**
 * Register page with Ocean Professional UI.
 * - Preserves useAuth.register, loading state, error handling, navigation on success
 * - Accessible labels and error messages
 * - Show/hide password toggle and basic client validation
 */
export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const fieldErrors = useMemo(() => {
    const errs = {};
    if (touched.name && (form.name || '').trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }
    if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) {
      errs.email = 'Enter a valid email address';
    }
    if (touched.password && (form.password || '').length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  }, [form, touched]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (fieldErrors.name || fieldErrors.email || fieldErrors.password) {
      setError('Please fix the highlighted fields.');
      return;
    }

    try {
      await register(form.name, form.email, form.password);
      const qsFrom = new URLSearchParams(location.search).get('from');
      const to = qsFrom || '/';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side" aria-hidden="true">
        <div className="auth-blur-bubble bubble-1" />
        <div className="auth-blur-bubble bubble-2" />
        <div className="auth-blur-bubble bubble-3" />
      </div>

      <div className="auth-panel">
        <div className="auth-brand">
          <div className="brand-mark">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <path d="M16 8L22 14L16 20L10 14L16 8Z" fill="white" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">CloudDash</span>
            <span className="brand-subtitle">Create your account</span>
          </div>
        </div>

        <div className="auth-headline">
          <h1>Create account</h1>
          <p className="muted">Join the platform</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          {error ? (
            <div className="alert error" role="alert" aria-live="assertive">
              <span className="alert-icon">!</span>
              <span>{error}</span>
            </div>
          ) : null}

          {/* Name */}
          <div className="form-row">
            <label htmlFor="name" className="form-label">
              Full name
            </label>
            <div className="field">
              <span className="field-icon" aria-hidden="true">👤</span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                className={`input ${fieldErrors.name ? 'input-error' : ''}`}
                required
              />
            </div>
            {fieldErrors.name && (
              <p id="name-error" className="field-help error" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="form-row">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <div className="field">
              <span className="field-icon" aria-hidden="true">📧</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                required
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" className="field-help error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="form-row">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="field">
              <span className="field-icon" aria-hidden="true">🔒</span>
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                className={`input ${fieldErrors.password ? 'input-error' : ''}`}
                required
              />
              <button
                type="button"
                className="field-action"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="field-help error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`btn primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <p className="muted center small" style={{ marginTop: 'var(--spacing-md)' }}>
            Already have an account?{' '}
            <Link to="/login" className="link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
