import React, { useMemo } from 'react';
import DataTable from '../components/ui/DataTable';
import '../styles/theme.css';

export default function Users() {
  const columns = useMemo(() => [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', accessor: 'status' },
  ], []);

  const rows = useMemo(() => [
    { id: '1', name: 'Alice Lee', email: 'alice@example.com', role: 'admin', status: 'active' },
    { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'invited' },
    { id: '3', name: 'Maya Roy', email: 'maya@example.com', role: 'user', status: 'active' },
  ], []);

  return (
    <div className="page">
      <div className="card-header">
        <span>Users</span>
        <button className="btn">+ Invite</button>
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
