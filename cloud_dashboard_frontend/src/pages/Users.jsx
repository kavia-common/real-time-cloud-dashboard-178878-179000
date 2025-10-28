import React, { useEffect, useMemo, useState } from 'react';
import { apiUsers } from '../api/endpoints';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.tsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import Toast from '../components/ui/Toast.jsx';

export default function Users() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="space-x-2">
            <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDeleteAsk(row.id || row._id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiUsers.list();
      setItems(Array.isArray(data?.users) ? data.users : Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ type: 'error', message: e?.response?.data?.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = () => {
    setEditing({ name: '', email: '', role: 'user', password: '' });
    setShowForm(true);
  };

  const onEdit = (row) => {
    setEditing({ ...row, id: row.id || row._id, password: '' });
    setShowForm(true);
  };

  const onDeleteAsk = (id) => setConfirm({ open: true, id });

  const onDelete = async () => {
    try {
      await apiUsers.remove(confirm.id);
      setToast({ type: 'success', message: 'User deleted' });
      setConfirm({ open: false, id: null });
      load();
    } catch (e) {
      setToast({ type: 'error', message: e?.response?.data?.message || 'Delete failed' });
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      if (editing.id || editing._id) {
        const id = editing.id || editing._id;
        const payload = { name: editing.name, email: editing.email, role: editing.role };
        if (editing.password) payload.password = editing.password;
        await apiUsers.update(id, payload);
        setToast({ type: 'success', message: 'User updated' });
      } else {
        await apiUsers.create(editing);
        setToast({ type: 'success', message: 'User created' });
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Save failed' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={onCreate}>Add User</Button>
      </div>

      <DataTable columns={columns} data={items} loading={loading} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing?.id || editing?._id ? 'Edit User' : 'Create User'}>
        <form className="space-y-3" onSubmit={onSave}>
          <Input label="Name" value={editing?.name || ''} onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))} required />
          <Input label="Email" type="email" value={editing?.email || ''} onChange={(e) => setEditing((s) => ({ ...s, email: e.target.value }))} required />
          <Input label="Role" value={editing?.role || ''} onChange={(e) => setEditing((s) => ({ ...s, role: e.target.value }))} required />
          <Input label="Password" type="password" value={editing?.password || ''} onChange={(e) => setEditing((s) => ({ ...s, password: e.target.value }))} placeholder={editing?.id || editing?._id ? 'Leave blank to keep' : ''} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={onDelete}
      />

      {toast && <Toast type={toast.type} onClose={() => setToast(null)}>{toast.message}</Toast>}
    </div>
  );
}
