import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/ui/Toast.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.ok) {
      navigate(next);
    } else {
      setToast({ type: 'error', message: res.error || 'Login failed' });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">Login</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <div className="text-sm text-gray-500">
          No account?{' '}
          <Link className="text-blue-600 hover:underline" to="/register">
            Register
          </Link>
        </div>
      </div>
      {toast && <Toast type={toast.type} onClose={() => setToast(null)}>{toast.message}</Toast>}
    </div>
  );
}
