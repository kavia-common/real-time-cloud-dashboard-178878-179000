import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiMetrics } from '../api/endpoints';
import useSocket from '../hooks/useSocket';
import LiveIndicator from '../components/ui/LiveIndicator';
import Tabs from '../components/ui/Tabs';
import '../styles/theme.css';

interface ActivityItem {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
}

/**
 * PUBLIC_INTERFACE
 * Activity Page with Timeline View
 * Displays recent activity with real-time updates, featuring a timeline layout with avatars
 * and colored accents for different action types.
 */
export default function Activity() {
  const [allRows, setAllRows] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  const { connected, subscribe } = useSocket('/metrics');

  const normalizeRealtime = useCallback((payload: any): ActivityItem => {
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
      const { data } = await apiMetrics.activity();
      setAllRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load activity.');
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsub1 = subscribe('metric:update', (payload) => {
      setAllRows((prev) => [normalizeRealtime(payload), ...prev].slice(0, 300));
    });
    const unsub2 = subscribe('activity', (payload) => {
      const row: ActivityItem = {
        id: payload?.id || `rt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: payload?.time || new Date().toISOString(),
        user: payload?.user || 'system',
        action: payload?.action || payload?.type || 'INFO',
        details: payload?.details ?? payload?.message ?? JSON.stringify(payload),
      };
      setAllRows((prev) => [row, ...prev].slice(0, 300));
    });
    return () => {
      unsub1 && unsub1();
      unsub2 && unsub2();
    };
  }, [subscribe, normalizeRealtime]);

  const getActionColor = (action: string): string => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('error') || actionLower.includes('fail')) return 'var(--color-error)';
    if (actionLower.includes('warn')) return 'var(--color-warning)';
    if (actionLower.includes('success') || actionLower.includes('complete')) return 'var(--color-success)';
    return 'var(--color-primary)';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabItems = useMemo(
    () => [
      { id: 'timeline', label: 'Timeline', icon: '📅' },
      { id: 'table', label: 'Table', icon: '📊' },
    ],
    []
  );

  return (
    <div className="page">
      <div className="card">
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Activity Feed</h2>
            <p className="muted small" style={{ marginTop: '4px' }}>
              Real-time activity log with {allRows.length} events
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LiveIndicator connected={connected} labelLive="Live" labelOffline="Offline" />
            <button className="btn ghost" onClick={load} disabled={loading}>
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        <div className="card-content">
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Tabs
              items={tabItems}
              activeTab={viewMode}
              onChange={(id) => setViewMode(id as 'timeline' | 'table')}
              variant="segmented"
            />
          </div>

          {loading && (
            <div role="status" aria-live="polite" style={{ marginBottom: 'var(--spacing-md)' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />
              ))}
            </div>
          )}

          {error && !loading && (
            <div
              className="badge error"
              role="alert"
              style={{ display: 'block', marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)' }}
            >
              {error}
            </div>
          )}

          {viewMode === 'timeline' && !loading && (
            <div
              className="activity-timeline"
              style={{
                position: 'relative',
                paddingLeft: 'var(--spacing-xl)',
              }}
            >
              {/* Timeline line */}
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '16px',
                  bottom: '16px',
                  width: '2px',
                  background: 'var(--color-border)',
                }}
                aria-hidden="true"
              />

              {allRows.length === 0 && (
                <div
                  className="empty-state center"
                  style={{
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-xl)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', opacity: 0.5 }} aria-hidden="true">
                    📋
                  </div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>No activity yet</div>
                  <div className="muted small">Activity will appear here as events occur</div>
                </div>
              )}

              {allRows.map((item, index) => {
                const actionColor = getActionColor(item.action);
                const date = new Date(item.time);
                return (
                  <div
                    key={item.id}
                    className="timeline-item"
                    style={{
                      position: 'relative',
                      marginBottom: index < allRows.length - 1 ? 'var(--spacing-lg)' : 0,
                      paddingLeft: 'var(--spacing-xl)',
                    }}
                  >
                    {/* Avatar/Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '0',
                        top: '4px',
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: `linear-gradient(135deg, ${actionColor}, var(--color-surface))`,
                        border: '3px solid var(--color-surface)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'white',
                        zIndex: 1,
                      }}
                      aria-hidden="true"
                    >
                      {getInitials(item.user)}
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        borderLeft: `4px solid ${actionColor}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-md)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 'var(--spacing-xs)',
                          flexWrap: 'wrap',
                          gap: 'var(--spacing-xs)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                            {item.user}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: `${actionColor}22`,
                              color: actionColor,
                              border: `1px solid ${actionColor}44`,
                            }}
                          >
                            {item.action}
                          </span>
                        </div>
                        <time
                          className="small muted"
                          dateTime={date.toISOString()}
                          title={date.toISOString()}
                          style={{ fontWeight: 'var(--font-weight-medium)' }}
                        >
                          {date.toLocaleTimeString()}
                        </time>
                      </div>
                      <div className="muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {item.details}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'table' && !loading && (
            <div className="table" style={{ overflowX: 'auto' }}>
              <table className="table-el">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {allRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div className="muted">No activity to display</div>
                      </td>
                    </tr>
                  ) : (
                    allRows.map((item) => {
                      const date = new Date(item.time);
                      return (
                        <tr key={item.id}>
                          <td>
                            <time dateTime={date.toISOString()} title={date.toISOString()}>
                              {date.toLocaleString()}
                            </time>
                          </td>
                          <td>{item.user}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: `${getActionColor(item.action)}22`,
                                color: getActionColor(item.action),
                                border: `1px solid ${getActionColor(item.action)}44`,
                              }}
                            >
                              {item.action}
                            </span>
                          </td>
                          <td className="muted small">{item.details}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
