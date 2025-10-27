import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DiagnosticsOverlay from '../components/ui/DiagnosticsOverlay.jsx';
import { API_BASE_URL, API_PATH_PREFIX } from '../api/endpoints';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [showDiag, setShowDiag] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
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
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.userMessage ||
        err?.message ||
        'Registration failed';
      setError(message);
    }
  };

  return (
    <div className="auth-shell">
      <style>{`
        .auth-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .auth-side {
          position: relative;
          overflow: hidden;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
        }
        
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          animation: float 20s infinite linear;
        }
        
        .shape-1 { width: 80px; height: 80px; top: 20%; left: 20%; animation-delay: 0s; }
        .shape-2 { width: 120px; height: 120px; top: 60%; left: 10%; animation-delay: -5s; }
        .shape-3 { width: 60px; height: 60px; top: 40%; left: 70%; animation-delay: -10s; }
        .shape-4 { width: 100px; height: 100px; top: 70%; left: 60%; animation-delay: -15s; }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 20px) rotate(90deg); }
          50% { transform: translate(0, 40px) rotate(180deg); }
          75% { transform: translate(-20px, 20px) rotate(270deg); }
        }
        
        .auth-panel { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 40px 32px; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
        }
        
        .auth-content {
          width: 100%;
          max-width: 420px;
        }
        
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .brand-mark {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .brand-text { 
          display: flex; 
          flex-direction: column; 
        }
        
        .brand-title { 
          font-weight: 800; 
          font-size: 24px; 
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .brand-subtitle { 
          font-size: 13px; 
          color: #6B7280; 
          font-weight: 500;
        }
        
        .auth-headline h1 { 
          margin: 0 0 8px; 
          font-size: 32px;
          font-weight: 800;
          color: #1F2937;
        }
        
        .muted { 
          color: #6B7280; 
          margin: 0 0 24px; 
          font-size: 16px;
          line-height: 1.5;
        }
        
        .auth-form { 
          width: 100%; 
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .form-row { 
          margin-bottom: 20px; 
        }
        
        .form-label { 
          display: block; 
          font-weight: 600; 
          color: #374151;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .field { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          border: 1.5px solid #E5E7EB; 
          background: #fff;
          border-radius: 12px; 
          padding: 12px 16px;
          transition: all 0.2s ease;
        }
        
        .field:hover {
          border-color: #9CA3AF;
        }
        
        .field:focus-within { 
          border-color: #667eea; 
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
          transform: translateY(-1px);
        }
        
        .field.error {
          border-color: #EF4444;
        }
        
        .field-icon { 
          color: #9CA3AF;
          font-size: 18px;
          width: 20px;
          text-align: center;
        }
        
        .field-action { 
          border: 0; 
          background: transparent; 
          cursor: pointer; 
          padding: 4px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #6B7280;
        }
        
        .field-action:hover {
          background: #F3F4F6;
        }
        
        .input { 
          flex: 1; 
          border: 0; 
          outline: none; 
          font-size: 15px; 
          background: transparent;
          color: #1F2937;
        }
        
        .input::placeholder {
          color: #9CA3AF;
        }
        
        .field-help { 
          font-size: 13px; 
          margin-top: 6px; 
          color: #6B7280; 
        }
        
        .field-help.error { 
          color: #EF4444; 
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn { 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          padding: 14px 20px;
          border-radius: 12px; 
          border: 1px solid transparent; 
          font-weight: 600; 
          font-size: 15px;
          transition: all 0.2s ease; 
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn:hover::before {
          left: 100%;
        }
        
        .btn.primary { 
          background: linear-gradient(135deg, #667eea, #764ba2); 
          color: #fff; 
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn.primary:hover { 
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn.ghost { 
          background: #fff; 
          border-color: #E5E7EB; 
          color: #374151;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .btn.ghost:hover { 
          background: #F9FAFB; 
          border-color: #9CA3AF;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .w-full { 
          width: 100%; 
        }
        
        .loading { 
          opacity: 0.8; 
          cursor: not-allowed; 
          transform: none !important;
        }
        
        .divider { 
          display: flex; 
          align-items: center; 
          margin: 24px 0; 
          color: #6B7280; 
          font-size: 13px;
          font-weight: 500;
        }
        
        .divider::before, 
        .divider::after { 
          content: ''; 
          flex: 1; 
          height: 1px; 
          background: #E5E7EB; 
        }
        
        .divider::before { 
          margin-right: 16px; 
        }
        
        .divider::after { 
          margin-left: 16px; 
        }
        
        .alert { 
          display: flex; 
          align-items: flex-start; 
          gap: 12px; 
          padding: 16px; 
          border-radius: 12px; 
          margin-bottom: 20px;
          animation: slideIn 0.3s ease;
        }
        
        .alert.error { 
          background: #FEF2F2; 
          color: #991B1B; 
          border: 1px solid #FECACA; 
        }
        
        .alert-icon { 
          font-weight: 700; 
          background: #EF4444;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }
        
        .link { 
          color: #667eea; 
          text-decoration: none; 
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .link:hover { 
          color: #764ba2; 
          text-decoration: underline; 
        }
        
        .link.subtle { 
          color: #6B7280; 
          font-size: 13px;
        }
        
        .center { 
          text-align: center; 
        }
        
        .small { 
          font-size: 14px; 
        }
        
        .social-mark {
          font-size: 18px;
        }
        
        .terms-text {
          font-size: 13px;
          color: #6B7280;
          text-align: center;
          margin-top: 16px;
          line-height: 1.4;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 960px) {
          .auth-shell { 
            grid-template-columns: 1fr; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .auth-side { 
            display: none; 
          }
          .auth-panel { 
            padding: 24px; 
            background: rgba(255, 255, 255, 0.98);
          }
          .auth-form {
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
        }
        
        @media (max-width: 480px) {
          .auth-panel {
            padding: 16px;
          }
          .auth-form {
            padding: 24px;
            border-radius: 16px;
          }
          .auth-headline h1 {
            font-size: 28px;
          }
        }
      `}</style>

      {/* Enhanced decorative side with animated shapes */}
      <div className="auth-side" aria-hidden="true">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Form section */}
      <div className="auth-panel">
        <div className="auth-content">
          <div className="auth-brand">
            <div className="brand-mark">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="white" />
                <path d="M16 8L22 14L16 20L10 14L16 8Z" fill="#667eea" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">CloudDash</span>
              <span className="brand-subtitle">Join our community</span>
            </div>
          </div>

          <div className="auth-headline">
            <h1>Create account</h1>
            <p className="muted">Start your journey with us today</p>
          </div>

          <form onSubmit={submit} className="auth-form" noValidate>
            {error && (
              <div className="alert error" role="alert" aria-live="assertive">
                <span className="alert-icon">!</span>
                <span>
                  {error}
                  {(/Network error|CORS|blocked|timeout/i.test(error)) && (
                    <>
                      {' '}
                      <br />
                      <span className="small">
                        Connection issue detected. Current base: {API_BASE_URL}, prefix: {API_PATH_PREFIX || '(none)'}.
                        {' '}
                        <button
                          type="button"
                          className="link"
                          onClick={() => setShowDiag(true)}
                          style={{ marginLeft: 6 }}
                        >
                          Run diagnostics
                        </button>
                      </span>
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Name Field */}
            <div className="form-row">
              <label htmlFor="name" className="form-label">Full name</label>
              <div className={`field ${fieldErrors.name ? 'error' : ''}`}>
                <span className="field-icon" aria-hidden="true">👤</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className="input"
                  required
                />
              </div>
              {fieldErrors.name && (
                <p id="name-error" className="field-help error" role="alert">
                  <span>⚠</span> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="form-row">
              <label htmlFor="email" className="form-label">Email address</label>
              <div className={`field ${fieldErrors.email ? 'error' : ''}`}>
                <span className="field-icon" aria-hidden="true">✉️</span>
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
                  className="input"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="field-help error" role="alert">
                  <span>⚠</span> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-row">
              <label htmlFor="password" className="form-label">Password</label>
              <div className={`field ${fieldErrors.password ? 'error' : ''}`}>
                <span className="field-icon" aria-hidden="true">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className="input"
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
                  <span>⚠</span> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`btn primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create your account'
              )}
            </button>

            <div className="divider"><span>or sign up with</span></div>

            <button type="button" className="btn ghost w-full" aria-label="Continue with Google">
              <span className="social-mark" style={{marginRight: '8px'}}>🔶</span>
              Continue with Google
            </button>

            <p className="terms-text">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="link">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="link">Privacy Policy</Link>
            </p>

            <p className="muted center small" style={{ marginTop: 24 }}>
              Already have an account?{' '}
              <Link to="/login" className="link" style={{fontWeight: '600'}}>
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
      {showDiag && (
        <DiagnosticsOverlay open={showDiag} onClose={() => setShowDiag(false)} />
      )}
    </div>
  );
}