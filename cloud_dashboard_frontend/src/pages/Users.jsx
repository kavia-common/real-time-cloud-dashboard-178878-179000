/**
 * Users - admin-only user management.
 * - List users
 * - Create, Update, Delete users
 */

import React, { useEffect, useMemo, useState } from 'react';
import http from '../api/http';
import { endpoints } from '../api/endpoints';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import Input from '../components/ui/Input.tsx';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const { user } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.users.list);
      setUsers(res.data || []);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const columns = useMemo(() => ([
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ]), []);

  const onEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, email: row.email, password: '', role: row.role });
    setModalOpen(true);
  };

  const onDelete = (row) => {
    setConfirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${row.name}?`,
      onConfirm: async () => {
        try {
          await http.delete(endpoints.users.delete(row._id));
          await loadUsers();
        } catch {
          // noop
        } finally {
          setConfirm(null);
        }
      },
      onCancel: () => setConfirm(null),
    });
  };

  const onCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await http.put(endpoints.users.update(editing._id), payload);
      } else {
        await http.post(endpoints.users.create, form);
      }
      setModalOpen(false);
      await loadUsers();
    } catch {
      // noop
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center text-gray-600 py-10">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <Button onClick={onCreate}>New User</Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found."
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Create User'}>
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Leave blank to keep current password' : ''} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
    </div>
  );
}
