import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
    const to = location.state?.from?.pathname || '/';
    navigate(to, { replace: true });
  };

  return (
    <div className="auth-page">
      <form className="card auth" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to your account</p>
        <label>Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
        />
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="muted small">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
