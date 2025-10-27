import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.email || !form.password) return 'Email and password are required.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(next);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
        <div className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link className="text-blue-600" to="/register">
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
