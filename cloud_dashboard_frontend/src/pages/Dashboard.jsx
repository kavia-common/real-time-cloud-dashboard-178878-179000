import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/ui/StatCard';
import ChartLine from '../components/ui/ChartLine';
import LiveIndicator from '../components/ui/LiveIndicator';
import useSocket from '../hooks/useSocket';
import { apiMetrics } from '../api/endpoints';
import '../styles/theme.css';

/**
 * Dashboard - Enhanced with sleek modern UI
 * Features hero header, stat cards with trends, refined line chart, and live feed
 */
export default function Dashboard() {
  const [feed, setFeed] = useState([]);
  const { connected, subscribe } = useSocket('/metrics');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, total: 0, average: 0, latest: [], previous: {} });
  const [chartData, setChartData] = useState([]);

  const makeZeroSeries = (n = 10) => Array.from({ length: n }).map((_, i) => ({ x: i, y: 0 }));

  // Fetch initial stats
  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await apiMetrics.stats();
        const currentCount = Number(data?.count ?? 0);
        const currentTotal = Number(data?.total ?? 0);
        const currentAverage = Number(data?.average ?? 0);
        const latest = Array.isArray(data?.latest) ? data.latest : [];

        setStats({
          count: currentCount,
          total: currentTotal,
          average: currentAverage,
          latest,
          previous: {
            count: Math.max(0, currentCount - 10),
            total: Math.max(0, currentTotal - 100),
            average: Math.max(0, currentAverage - 5),
          },
        });

        const series = (latest || []).map((m, idx) => ({
          x: idx,
          y: Number(m?.value ?? 0),
        }));
        setChartData(series.length ? series : makeZeroSeries(10));
      } catch {
        setChartData(makeZeroSeries(10));
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Subscribe to live updates
  useEffect(() => {
    const unsub = subscribe('metric:update', (payload) => {
      const value = Number(payload?.value ?? 0);

      setFeed((f) => [
        {
          time: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random(),
          ...payload,
        },
        ...f,
      ].slice(0, 15));

      setChartData((prev) => {
        const lastX = prev.length ? prev[prev.length - 1].x : 0;
        const nextPoint = { x: lastX + 1, y: value };
        const updated = [...prev, nextPoint];
        return updated.slice(Math.max(updated.length - 50, 0));
      });

      setStats((s) => {
        const latest = Array.isArray(s.latest) ? s.latest : [];
        const nextLatest = [{ value }, ...latest].slice(0, 20);
        const nextCount = (s.count || 0) + 1;
        const nextTotal = (s.total || 0) + value;
        const nextAverage = nextLatest.length
          ? nextLatest.reduce((acc, m) => acc + Number(m.value || 0), 0) / nextLatest.length
          : 0;

        return {
          count: nextCount,
          total: nextTotal,
          average: nextAverage,
          latest: nextLatest,
          previous: s.previous,
        };
      });
    });
    return unsub;
  }, [subscribe]);

  // Calculate trends
  const countTrend = useMemo(() => {
    if (!stats.previous.count || stats.previous.count === 0) return 0;
    return ((stats.count - stats.previous.count) / stats.previous.count) * 100;
  }, [stats]);

  const totalTrend = useMemo(() => {
    if (!stats.previous.total || stats.previous.total === 0) return 0;
    return ((stats.total - stats.previous.total) / stats.previous.total) * 100;
  }, [stats]);

  const avgTrend = useMemo(() => {
    if (!stats.previous.average || stats.previous.average === 0) return 0;
    return ((stats.average - stats.previous.average) / stats.previous.average) * 100;
  }, [stats]);

  const avgDisplay = useMemo(() => (stats.average ? Number(stats.average).toFixed(2) : '0'), [stats.average]);
  const totalDisplay = useMemo(() => String(stats.total || 0), [stats.total]);
  const countDisplay = useMemo(() => String(stats.count || 0), [stats.count]);

  return (
    <div className="page dashboard" role="main" aria-label="Dashboard">
      {/* Hero Header */}
      <div
        className="dashboard-hero"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          padding: 'var(--spacing-xl)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--spacing-lg)',
          border: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div>
              <h1 className="dashboard-title" style={{ marginBottom: 'var(--spacing-xs)' }}>
                Performance Dashboard
              </h1>
              <p className="dashboard-subtitle" style={{ fontSize: 'var(--font-size-base)' }}>
                Real-time system metrics and monitoring
              </p>
            </div>
            <LiveIndicator connected={connected} labelLive="Live Updates" labelOffline="Connecting..." />
          </div>
        </div>
        {/* Decorative gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Stat Cards Grid */}
      <div className="grid stats" aria-live="polite" role="region" aria-label="Statistics">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card" role="status" aria-label="Loading statistic">
                <div className="skeleton" style={{ height: 80 }} />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Samples"
              value={countDisplay}
              subtitle="Latest metric samples"
              icon="📦"
              trend={countTrend}
              trendLabel="vs baseline"
            />
            <StatCard
              title="Total Value"
              value={totalDisplay}
              subtitle="Sum of latest values"
              icon="∑"
              trend={totalTrend}
              trendLabel="vs baseline"
            />
            <StatCard
              title="Average"
              value={avgDisplay}
              subtitle="Average of latest values"
              icon="𝄇"
              trend={avgTrend}
              trendLabel="vs baseline"
            />
            <StatCard
              title="Connection"
              value={connected ? 'Live' : 'Offline'}
              subtitle="Socket status"
              icon="🛰️"
              variant={connected ? 'success' : 'error'}
            />
          </>
        )}
      </div>

      {/* Chart and Feed Grid */}
      <div className="grid two" style={{ gap: 'var(--spacing-lg)' }}>
        {/* Chart Container */}
        <div className="chart-container" role="region" aria-label="Performance metrics chart">
          {loading ? (
            <div className="card">
              <div className="skeleton" style={{ height: 400 }} />
            </div>
          ) : (
            <ChartLine
              data={chartData}
              height={340}
              color={connected ? 'var(--color-primary)' : 'var(--color-border-dark)'}
              title="Traffic Metrics"
              showGrid={true}
              showGradient={true}
            />
          )}
        </div>

        {/* Live Events Feed */}
        <div className="card feed-card" role="region" aria-label="Live events feed">
          <div
            className="card-header"
            style={{
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h3 style={{ margin: 0 }}>Live Events</h3>
              <LiveIndicator connected={connected} labelLive="Streaming" labelOffline="Offline" />
            </div>
          </div>

          <div className="card-content">
            <div className="feed-container" style={{ maxHeight: 340, overflowY: 'auto' }}>
              {loading ? (
                <div role="status" aria-live="polite">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />
                  ))}
                </div>
              ) : feed.length > 0 ? (
                <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {feed.map((item) => (
                    <div
                      key={item.id}
                      className="feed-item"
                      style={{
                        padding: '10px 14px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div
                        className="feed-item-header"
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          marginBottom: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="feed-time small muted" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {item.time}
                        </span>
                        <span className="badge ok">{item.type || 'INFO'}</span>
                        {!connected && <span className="badge warn">Cached</span>}
                      </div>
                      <div className="feed-message" style={{ fontSize: 'var(--font-size-sm)' }}>
                        {item.message || `Value: ${item.value ?? ''}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="empty-state center"
                  style={{
                    flexDirection: 'column',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-xl)',
                    textAlign: 'center',
                  }}
                >
                  <div className="empty-icon" style={{ fontSize: '2.5rem', opacity: 0.5 }} aria-hidden="true">
                    📊
                  </div>
                  <div className="empty-text" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    Awaiting live events...
                  </div>
                  <div className="empty-subtext muted small">Events will appear here in real-time</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
