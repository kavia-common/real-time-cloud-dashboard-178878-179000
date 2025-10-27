import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
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
      await registerUser(form.name, form.email, form.password);
      navigate(next);
    } catch (err) {
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
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <Input label="Name" name="name" value={form.name} onChange={onChange} required />
        <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating...' : 'Create account'}
        </Button>
        <div className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="text-blue-600" to="/login">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
