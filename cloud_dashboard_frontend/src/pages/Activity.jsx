import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import { apiMetrics } from '../api/endpoints';
import useSocket from '../hooks/useSocket';
import LiveIndicator from '../components/ui/LiveIndicator';
import '../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * Activity Page
 * Fetches recent activity via GET /metrics/activity and listens for realtime updates on /metrics
 * - Renders a table with client-side pagination controls
 * - Prepends new realtime entries at the top of the feed if socket events are available
 * - Gracefully handles loading, empty, and error states
 */
export default function Activity() {
  const columns = useMemo(() => [
    {
      header: 'Time',
      accessor: 'time',
      sortable: true,
      render: (r) => {
        const d = r.time ? new Date(r.time) : null;
        return d ? (
          <time dateTime={d.toISOString()} title={d.toISOString()}>
            {d.toLocaleString()}
          </time>
        ) : (
          <span className="muted">-</span>
        );
      },
    },
    { header: 'User', accessor: 'user', sortable: true },
    {
      header: 'Action',
      accessor: 'action',
      sortable: true,
      render: (r) => (
        <span
          className={`badge ${String(r.action || '').toLowerCase().includes('error') ? 'warn' : 'ok'}`}
        >
          {r.action || 'INFO'}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (r) => (
        <span className="muted" title={typeof r.details === 'string' ? r.details : JSON.stringify(r.details)}>
          {typeof r.details === 'string' ? r.details : JSON.stringify(r.details)}
        </span>
      ),
    },
  ], []);

  const [allRows, setAllRows] = useState([]); // raw list
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Client-side pagination for the page container (DataTable has its own but we keep this minimal pager too)
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, page]);

  // Socket: metrics namespace
  const { connected, subscribe, status } = useSocket('/metrics');

  const normalizeRealtime = useCallback((payload) => {
    // Backend likely emits { type, message, value, user? } for 'metric:update' or activity events
    const now = new Date().toISOString();
    return {
      id: `rt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      time: now,
      user: payload?.user || 'system',
      action: payload?.type || 'INFO',
      details: payload?.message ?? JSON.stringify(payload),
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Prefer using the helper if available
      const { data } = await apiMetrics.activity();
      setAllRows(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load activity.');
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription: try both 'metric:update' and 'activity' style events if available
  useEffect(() => {
    const unsub1 = subscribe('metric:update', (payload) => {
      setAllRows((prev) => [normalizeRealtime(payload), ...prev].slice(0, 300));
      setPage(1);
    });
    const unsub2 = subscribe('activity', (payload) => {
      // If backend emits direct activity objects ensure fields exist; otherwise normalize
      const row = {
        id: payload?.id || `rt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: payload?.time || new Date().toISOString(),
        user: payload?.user || 'system',
        action: payload?.action || payload?.type || 'INFO',
        details: payload?.details ?? payload?.message ?? JSON.stringify(payload),
      };
      setAllRows((prev) => [row, ...prev].slice(0, 300));
      setPage(1);
    });
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
    };
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

        <div className="card-content" aria-live="polite">
          {loading && (
            <div className="muted" role="status" aria-live="polite" style={{ marginBottom: 8 }}>
              Loading activity...
              <div className="skeleton" style={{ height: 10, marginTop: 6 }} />
              <div className="skeleton" style={{ height: 10, marginTop: 6 }} />
              <div className="skeleton" style={{ height: 10, marginTop: 6 }} />
            </div>
          )}

          {!!error && !loading && (
            <div className="warn" role="alert" style={{ marginBottom: 8 }}>
              {error}
            </div>
          )}

          <DataTable columns={columns} rows={pageRows} />

          {(!pageRows || pageRows.length === 0) && !loading && !error && (
            <div className="muted center" style={{ marginTop: 8 }}>
              No recent activity yet.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span className="small muted">
              Page {page} of {totalPages} • {allRows.length} items • {status}
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
