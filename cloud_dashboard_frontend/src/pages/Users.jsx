import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import http from '../api/http';
import endpoints from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

export default function Users() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', status: 'active', password: '' });
  const [toDelete, setToDelete] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const { data } = await http.get(endpoints.users.list);
      setRows(data);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const columns = useMemo(() => {
    const base = [
      { header: 'Name', accessor: 'name' },
      { header: 'Email', accessor: 'email' },
      { header: 'Role', accessor: 'role' },
      { header: 'Status', accessor: 'status' },
    ];
    if (isAdmin) {
      base.push({
        header: 'Actions',
        accessor: 'actions',
        render: (r) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={() => {
              const name = prompt('Name', r.name);
              if (name == null) return;
              const role = prompt('Role (admin/user)', r.role) || r.role;
              const status = prompt('Status (active/invited/disabled)', r.status) || r.status;
              handleUpdate(r.id, { name, role, status });
            }}>Edit</button>
            <button className="btn danger" onClick={() => setToDelete(r)}>Delete</button>
          </div>
        )
      });
    }
    return base;
  }, [isAdmin]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (form.password) payload.password = form.password;
      const { data } = await http.post(endpoints.users.create, payload);
      setRows((rs) => [data, ...rs]);
      setShowCreate(false);
      setForm({ name: '', email: '', role: 'user', status: 'active', password: '' });
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create user');
    }
  }

  async function handleUpdate(id, patch) {
    try {
      const { data } = await http.put(endpoints.users.update(id), patch);
      setRows((rs) => rs.map((r) => (r.id === id ? data : r)));
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to update user');
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await http.delete(endpoints.users.delete(toDelete.id));
      setRows((rs) => rs.filter((r) => r.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to delete user');
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <span>Users</span>
          {isAdmin ? <button className="btn" onClick={() => setShowCreate((s) => !s)}>+ Invite</button> : null}
        </div>
        {error ? <div className="badge warn" role="alert">{error}</div> : null}
        {isAdmin && showCreate ? (
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="invited">invited</option>
                <option value="disabled">disabled</option>
              </select>
              <input type="password" placeholder="Initial password (optional)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <button className="btn primary" type="submit">Create</button>
              <button className="btn ghost" type="button" onClick={() => setShowCreate(false)} style={{ marginLeft: 8 }}>Cancel</button>
            </div>
          </form>
        ) : null}
        {isAdmin ? (
          <DataTable columns={columns} rows={rows} />
        ) : (
          <div className="muted">You must be an admin to view users.</div>
        )}
        {loading ? <div className="muted" style={{ marginTop: 8 }}>Loading...</div> : null}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete User"
        message={toDelete ? `Are you sure you want to delete ${toDelete.email}?` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
