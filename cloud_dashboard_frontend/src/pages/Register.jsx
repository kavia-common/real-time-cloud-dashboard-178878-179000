import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/ui/Toast.jsx';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [toast, setToast] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await register(form);
    if (res.ok) {
      navigate(next);
    } else {
      setToast({ type: 'error', message: res.error || 'Register failed' });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">Register</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input label="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
        <div className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link className="text-blue-600 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </div>
      {toast && <Toast type={toast.type} onClose={() => setToast(null)}>{toast.message}</Toast>}
    </div>
  );
}
