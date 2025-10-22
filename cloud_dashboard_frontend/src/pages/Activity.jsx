import React, { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import http from '../api/http';
import endpoints from '../api/endpoints';
import '../styles/theme.css';

export default function Activity() {
  const columns = useMemo(() => [
    { header: 'Time', accessor: 'time', render: (r) => new Date(r.time).toLocaleString() },
    { header: 'User', accessor: 'user' },
    { header: 'Action', accessor: 'action' },
    { header: 'Details', accessor: 'details' },
  ], []);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await http.get(endpoints.metrics.activity);
      setRows(data);
    } catch (e) {
      // best-effort
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="card-header">
        <span>Recent Activity</span>
        <button className="btn ghost" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
