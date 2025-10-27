import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register page with scoped styles and aligned auth API.
 * - Posts to /auth/register via AuthContext
 * - Displays backend error messages
 * - Minimal, component-scoped CSS using a <style> tag
 */
export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info(
      'If you see net::ERR_BLOCKED_BY_CLIENT for /auth/* requests, an extension may be blocking them. ' +
        'Try disabling the blocker for this site or set REACT_APP_API_PATH_PREFIX=/api and ensure REACT_APP_API_BASE_URL points to your backend.'
    );
  }, []);

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
      setError(err?.response?.data?.error || err?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-shell">
      <style>{`
        .auth-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(249,250,251,1));
        }
        .auth-side {
          position: relative;
          background:
            radial-gradient(1200px 600px at -10% -20%, rgba(37,99,235,0.25), transparent 60%),
            radial-gradient(1000px 500px at 120% 120%, rgba(245,158,11,0.18), transparent 60%),
            linear-gradient(180deg, rgba(37,99,235,0.08), rgba(249,250,251,0.4));
        }
        .auth-blur-bubble { position: absolute; filter: blur(50px); opacity: .7; border-radius: 50%; }
        .bubble-1 { width: 240px; height: 240px; background: rgba(59,130,246,0.55); top: 15%; left: 20%; }
        .bubble-2 { width: 180px; height: 180px; background: rgba(245,158,11,0.45); bottom: 20%; right: 18%; }
        .bubble-3 { width: 120px; height: 120px; background: rgba(59,130,246,0.35); bottom: 10%; left: 30%; }

        .auth-panel { display: flex; align-items: center; justify-content: center; padding: 32px; }
        .auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .brand-mark { width: 48px; height: 48px; border-radius: 12px; display: grid; place-items: center;
          background: linear-gradient(135deg, #2563EB, #1E40AF); box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
        .brand-text { display: flex; flex-direction: column; }
        .brand-title { font-weight: 700; font-size: 18px; }
        .brand-subtitle { font-size: 12px; color: #6B7280; }
        .auth-headline h1 { margin: 0 0 6px; }
        .muted { color: #6B7280; margin: 0 0 16px; }

        .auth-form { width: 100%; max-width: 420px; background: #fff; border: 1px solid #E5E7EB;
          border-radius: 16px; padding: 32px; box-shadow: 0 12px 32px rgba(0,0,0,0.12); }

        .form-row { margin-bottom: 16px; }
        .form-label { display: block; font-weight: 600; margin-bottom: 6px; }
        .field { display: flex; align-items: center; gap: 8px; border: 1px solid #E5E7EB; background: #fff;
          border-radius: 12px; padding: 10px 12px; }
        .field:focus-within { border-color: rgba(37,99,235,.45); box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
        .field-icon { font-size: 16px; }
        .field-action { border: 0; background: transparent; cursor: pointer; }
        .input { flex: 1; border: 0; outline: none; font-size: 14px; }
        .input-error { outline: none; }
        .field-help { font-size: 12px; margin-top: 6px; color: #6B7280; }
        .field-help.error { color: #EF4444; }

        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px;
          border-radius: 12px; border: 1px solid transparent; font-weight: 600; transition: all .2s; }
        .btn.primary { background: #2563EB; color: #fff; }
        .btn.primary:hover { background: #1E40AF; }
        .w-full { width: 100%; }
        .loading { opacity: .7; cursor: not-allowed; }

        .alert { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; margin-bottom: 10px; }
        .alert.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
        .alert-icon { font-weight: 700; }

        .link { color: #2563EB; text-decoration: none; }
        .link:hover { text-decoration: underline; }
        .center { text-align: center; }
        .small { font-size: 12px; }

        @media (max-width: 960px) {
          .auth-shell { grid-template-columns: 1fr; }
          .auth-side { display: none; }
          .auth-panel { padding: 24px; }
        }
      `}</style>

      <div className="auth-side" aria-hidden="true">
        <div className="auth-blur-bubble bubble-1" />
        <div className="auth-blur-bubble bubble-2" />
        <div className="auth-blur-bubble bubble-3" />
      </div>

      <div className="auth-panel">
        <div className="auth-brand">
          <div className="brand-mark">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#2563EB" />
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

        <form onSubmit={submit} className="auth-form" noValidate>
          {error ? (
            <div className="alert error" role="alert" aria-live="assertive">
              <span className="alert-icon">!</span>
              <span>{error}</span>
            </div>
          ) : null}

          {/* Name */}
          <div className="form-row">
            <label htmlFor="name" className="form-label">Full name</label>
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
            {fieldErrors.name && <p id="name-error" className="field-help error" role="alert">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div className="form-row">
            <label htmlFor="email" className="form-label">Email address</label>
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
            {fieldErrors.email && <p id="email-error" className="field-help error" role="alert">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-row">
            <label htmlFor="password" className="form-label">Password</label>
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
            {fieldErrors.password && <p id="password-error" className="field-help error" role="alert">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className={`btn primary w-full ${loading ? 'loading' : ''}`} disabled={loading} aria-busy={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>

          <p className="muted center small" style={{ marginTop: 16 }}>
            Already have an account? <Link to="/login" className="link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
