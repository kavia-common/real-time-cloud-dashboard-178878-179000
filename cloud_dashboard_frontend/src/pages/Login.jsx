import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

/**
 * Login page with Ocean Professional UI.
 * - Preserves useAuth.login, loading state, error handling, navigation on success
 * - Accessible labels, aria attributes, and role="alert" for errors
 * - Show/hide password toggle
 */
export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const fieldErrors = useMemo(() => {
    const errs = {};
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
    setTouched({ email: true, password: true });
    setError('');

    // client validation
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (fieldErrors.email || fieldErrors.password) {
      setError('Please fix the highlighted fields.');
      return;
    }

    try {
      await login(form.email, form.password);
      const qsFrom = new URLSearchParams(location.search).get('from');
      const to = qsFrom || location.state?.from?.pathname || '/';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-shell">
      {/* Decorative gradient side with subtle shapes */}
      <div className="auth-side" aria-hidden="true">
        <div className="auth-blur-bubble bubble-1" />
        <div className="auth-blur-bubble bubble-2" />
        <div className="auth-blur-bubble bubble-3" />
      </div>

      {/* Form section */}
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
            <span className="brand-subtitle">Ocean Professional</span>
          </div>
        </div>

        <div className="auth-headline">
          <h1>Welcome back</h1>
          <p className="muted">Sign in to your account to continue</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          {error ? (
            <div className="alert error" role="alert" aria-live="assertive">
              <span className="alert-icon">!</span>
              <span>{error}</span>
            </div>
          ) : null}

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
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <Link to="/forgot-password" className="link subtle">
                Forgot password?
              </Link>
            </div>
            <div className="field">
              <span className="field-icon" aria-hidden="true">🔒</span>
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="divider"><span>or</span></div>

          <button type="button" className="btn ghost w-full" aria-label="Continue with Google">
            <span className="social-mark">🟦</span>
            Continue with Google
          </button>

          <p className="muted center small" style={{ marginTop: 'var(--spacing-md)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="link">
              Sign up now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}