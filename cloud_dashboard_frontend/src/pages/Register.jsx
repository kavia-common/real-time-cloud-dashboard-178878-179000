import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('Registration placeholder. Implement API call later.');
  };

  return (
    <div className="auth-page">
      <form className="card auth" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <p className="muted">Join the platform</p>
        <label>Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Jane Doe"
        />
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
        <button className="btn primary" type="submit">Register</button>
        <p className="muted small">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
