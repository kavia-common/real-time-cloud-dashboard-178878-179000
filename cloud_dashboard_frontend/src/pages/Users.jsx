import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import { apiUsers } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

// Lightweight toast implementation
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  const node = toast ? (
    <div
      role="status"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '12px 16px',
        borderLeft: `4px solid ${toast.type === 'error' ? 'var(--color-error)' : toast.type === 'success' ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
        zIndex: 50,
        borderRadius: 8,
      }}
      className="small"
    >
      {toast.message}
    </div>
  ) : null;
  return { show, node };
}

export default function Users() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // table and ui state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [editUser, setEditUser] = useState(null); // when set, edit modal open
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [errorIds, setErrorIds] = useState(new Set());

  const { show: showToast, node: toastNode } = useToast();

  const columns = useMemo(() => {
    const base = [
      { header: 'Name', accessor: 'name', sortable: true },
      { header: 'Email', accessor: 'email', sortable: true },
      { header: 'Role', accessor: 'role', sortable: true },
      { header: 'Status', accessor: 'status', sortable: true },
    ];
    if (isAdmin) {
      base.push({
        header: 'Actions',
        accessor: 'actions',
        render: (r) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={() => setEditUser(r)}>Edit</button>
            <button className="btn danger" onClick={() => setToDelete(r)}>Delete</button>
          </div>
        )
      });
    }
    return base;
  }, [isAdmin]);

  // const optimistic = useMemo(() => ({ pendingIds, errorIds }), [pendingIds, errorIds]);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setFetchError('');
    try {
      // Backend currently returns full list without pagination; we paginate client-side in DataTable
      const { data } = await apiUsers.list();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to load users';
      setFetchError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create/Edit form state and logic
  const [form, setForm] = useState({ name: '', email: '', role: 'user', status: 'active', password: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (editUser) {
      setForm({ name: editUser.name || '', email: editUser.email || '', role: editUser.role || 'user', status: editUser.status || 'active', password: '' });
      setFormErrors({});
    }
  }, [editUser]);

  const validate = useCallback(() => {
    const errors = {};
    if (!form.name || form.name.trim().length < 2) errors.name = 'Name is required';
    if (!form.email || !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(form.email)) errors.email = 'Valid email is required';
    if (!['user', 'admin'].includes(form.role)) errors.role = 'Role must be user or admin';
    if (!['active', 'invited', 'disabled'].includes(form.status)) errors.status = 'Invalid status';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const resetForm = () => {
    setForm({ name: '', email: '', role: 'user', status: 'active', password: '' });
    setFormErrors({});
  };

  async function submitCreate(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role, status: form.status };
      if (form.password) payload.password = form.password;
      const tempId = `tmp_${Date.now()}`;
      const optimisticUser = { id: tempId, ...payload };
      setPendingIds((s) => new Set([...s, tempId]));
      setRows((rs) => [optimisticUser, ...rs]);

      const { data } = await apiUsers.create(payload);
      // replace temp row with real row
      setRows((rs) => rs.map((r) => (r.id === tempId ? data : r)));
      setPendingIds((s) => {
        const n = new Set(s);
        n.delete(tempId);
        return n;
      });
      setCreateOpen(false);
      resetForm();
      showToast('User created', 'success');
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to create user';
      setErrorIds((s) => new Set([...s, 'create']));
      showToast(msg, 'error');
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!validate() || !editUser) return;
    const id = editUser.id;
    try {
      setPendingIds((s) => new Set([...s, id]));
      // optimistic patch of local row
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, name: form.name, role: form.role, status: form.status } : r)));
      const payload = { name: form.name, role: form.role, status: form.status };
      const { data } = await apiUsers.update(id, payload);
      setRows((rs) => rs.map((r) => (r.id === id ? data : r)));
      setPendingIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setEditUser(null);
      resetForm();
      showToast('User updated', 'success');
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to update user';
      setPendingIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setErrorIds((s) => new Set([...s, id]));
      showToast(msg, 'error');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    try {
      // optimistic remove
      setRows((rs) => rs.filter((r) => r.id !== id));
      await apiUsers.remove(id);
      setToDelete(null);
      showToast('User deleted', 'success');
    } catch (e) {
      // restore on failure
      setRows((_) => rows);
      const msg = e?.response?.data?.error || 'Failed to delete user';
      showToast(msg, 'error');
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Users</span>
          {isAdmin && (
            <button className="btn primary" onClick={() => { setCreateOpen(true); resetForm(); }}>
              + Invite
            </button>
          )}
        </div>

        {fetchError ? <div className="badge warn" role="alert">{fetchError}</div> : null}

        {isAdmin ? (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              optimistic={{ pendingIds, errorIds }}
              initialPageSize={10}
            />
            {loading ? (
              <div className="muted" role="status" aria-live="polite" style={{ marginTop: 8 }}>
                <div className="skeleton" style={{ height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12 }} />
              </div>
            ) : null}
          </>
        ) : (
          <div className="muted">You must be an admin to view users.</div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={createOpen}
        title="Invite User"
        onClose={() => setCreateOpen(false)}
        footer={(
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
            <Button variant="primary" onClick={submitCreate}>Create</Button>
          </div>
        )}
      >
        <form onSubmit={submitCreate}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Role</label>
              <select className="w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              {formErrors.role ? <div className="small" style={{ color: 'var(--color-error)' }}>{formErrors.role}</div> : null}
            </div>
            <div>
              <label>Status</label>
              <select className="w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="invited">invited</option>
                <option value="disabled">disabled</option>
              </select>
              {formErrors.status ? <div className="small" style={{ color: 'var(--color-error)' }}>{formErrors.status}</div> : null}
            </div>
          </div>
          <Input label="Initial password (optional)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editUser}
        title={editUser ? `Edit ${editUser.email}` : 'Edit'}
        onClose={() => { setEditUser(null); resetForm(); }}
        footer={(
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={() => { setEditUser(null); resetForm(); }}>Cancel</button>
            <Button variant="primary" onClick={submitEdit}>Save</Button>
          </div>
        )}
      >
        <form onSubmit={submitEdit}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={formErrors.name} required />
          <Input label="Email" type="email" value={form.email} disabled helperText="Email cannot be changed" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Role</label>
              <select className="w-full" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              {formErrors.role ? <div className="small" style={{ color: 'var(--color-error)' }}>{formErrors.role}</div> : null}
            </div>
            <div>
              <label>Status</label>
              <select className="w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="invited">invited</option>
                <option value="disabled">disabled</option>
              </select>
              {formErrors.status ? <div className="small" style={{ color: 'var(--color-error)' }}>{formErrors.status}</div> : null}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete User"
        message={toDelete ? `Are you sure you want to delete ${toDelete.email}?` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      {toastNode}
    </div>
  );
}
