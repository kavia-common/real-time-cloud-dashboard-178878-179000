import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#3B82F6"/>
                <path d="M16 8L22 14L16 20L10 14L16 8Z" fill="white"/>
                <circle cx="16" cy="22" r="2" fill="white"/>
              </svg>
              <span>YourApp</span>
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM7 3v6h2V3H7zm0 8v2h2v-2H7z"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="form-input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    {showPassword ? (
                      <>
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </>
                    ) : (
                      <>
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm7 7c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-14 0c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm12.535 4.95c.392.392.392 1.027 0 1.414s-1.027.392-1.414 0l-1.414-1.414c-.392-.392-.392-1.027 0-1.414s1.027-.392 1.414 0l1.414 1.414zm-9.9-9.9c.392.392.392 1.027 0 1.414s-1.027.392-1.414 0L3.807 5.05c-.392-.392-.392-1.027 0-1.414s1.027-.392 1.414 0l1.414 1.414z"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in to your account'
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button type="button" className="social-btn google-btn">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 7.39H9v2.63h4.28c-.18 1.13-.72 2.09-1.53 2.73v1.97h2.48c1.45-1.34 2.28-3.31 2.28-5.67 0-.57-.05-1.12-.15-1.66z"/>
                <path fill="#34A853" d="M9 17c2.43 0 4.47-.8 5.96-2.17l-2.48-1.97c-.67.45-1.53.72-2.48.72-1.91 0-3.53-1.29-4.11-3.02H2.35v2.04C3.84 15.22 6.26 17 9 17z"/>
                <path fill="#FBBC05" d="M4.89 10.56c-.18-.54-.18-1.12 0-1.66V6.86H2.35C1.73 8.15 1.73 9.85 2.35 11.14l2.54-2.58z"/>
                <path fill="#EA4335" d="M9 4.58c1.07 0 2.03.37 2.79 1.09l2.09-2.09C13.47 2.36 11.43 1.5 9 1.5 6.26 1.5 3.84 3.28 2.35 5.86l2.54 2.58C5.47 5.87 7.09 4.58 9 4.58z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-footer">
              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link to="/register" className="auth-footer-link">
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}