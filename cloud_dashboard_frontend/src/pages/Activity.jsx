import React, { useMemo } from 'react';
import DataTable from '../components/ui/DataTable';
import '../styles/theme.css';

export default function Activity() {
  const columns = useMemo(() => [
    { header: 'Time', accessor: 'time' },
    { header: 'User', accessor: 'user' },
    { header: 'Action', accessor: 'action' },
    { header: 'Details', accessor: 'details' },
  ], []);

  const rows = useMemo(() => [
    { id: 'a1', time: '10:01:22', user: 'Alice', action: 'Login', details: 'Success' },
    { id: 'a2', time: '10:05:11', user: 'John', action: 'Create', details: 'New API key' },
    { id: 'a3', time: '10:15:03', user: 'Maya', action: 'Delete', details: 'Removed user' },
  ], []);

  return (
    <div className="page">
      <div className="card-header">
        <span>Recent Activity</span>
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
