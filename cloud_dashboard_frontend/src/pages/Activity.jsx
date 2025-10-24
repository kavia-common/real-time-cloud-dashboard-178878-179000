import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import http from '../api/http';
import endpoints from '../api/endpoints';
import useSocket from '../hooks/useSocket';
import LiveIndicator from '../components/ui/LiveIndicator';
import '../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Activity Page
 * Fetches recent activity via GET /metrics/activity and listens for realtime updates on /metrics
 * - Renders a table with client-side pagination controls
 * - Appends new realtime entries at the top of the feed
 * - Gracefully handles socket disconnects with a status indicator
 */
export default function Activity() {
  const columns = useMemo(() => [
    { header: 'Time', accessor: 'time', render: (r) => new Date(r.time).toLocaleString() },
    { header: 'User', accessor: 'user' },
    { header: 'Action', accessor: 'action', render: (r) => (
      <span className={`badge ${r.action?.toLowerCase().includes('error') ? 'warn' : 'ok'}`}>{r.action}</span>
    ) },
    { header: 'Details', accessor: 'details' },
  ], []);

  const [allRows, setAllRows] = useState([]); // raw list
  const [loading, setLoading] = useState(false);

  // Simple client-side pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, page]);

  const { connected, subscribe } = useSocket('/metrics');

  const normalizeRealtime = useCallback((payload) => {
    // Backend emits { type, message, value } for metric:update; convert to activity row
    const now = new Date().toISOString();
    return {
      id: `rt-${Date.now()}`,
      time: now,
      user: 'system',
      action: payload?.type || 'INFO',
      details: payload?.message ?? JSON.stringify(payload),
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await http.get(endpoints.metrics.activity);
      // data is already normalized by backend
      setAllRows(Array.isArray(data) ? data : []);
      setPage(1); // reset to first page on reload
    } catch (e) {
      // non-blocking error
      // Optionally we could show a toast if a notification system exists
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    // Subscribe to metrics namespace 'metric:update' events
    const unsubscribe = subscribe('metric:update', (payload) => {
      setAllRows((prev) => {
        const next = [normalizeRealtime(payload), ...prev];
        // keep list from growing unbounded, cap to, say, 200
        return next.slice(0, 200);
      });
      // If currently on last page view (page 1 due to newest at top), keep it
      setPage(1);
    });
    return () => unsubscribe && unsubscribe();
  }, [subscribe, normalizeRealtime]);

  // Pagination handlers
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <span>Recent Activity</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LiveIndicator connected={connected} labelLive="Streaming" labelOffline="Offline" />
            <button className="btn ghost" onClick={load} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="card-content">
          <DataTable columns={columns} rows={pageRows} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span className="small muted">
              Page {page} of {totalPages} • {allRows.length} items
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={prevPage} disabled={page <= 1}>Previous</button>
              <button className="btn ghost" onClick={nextPage} disabled={page >= totalPages}>Next</button>
            </div>
          </div>
          {!connected && (
            <div className="small muted" style={{ marginTop: 8 }}>
              Reconnecting to realtime stream. You can still manually refresh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
