import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/ui/StatCard';
import ChartLine from '../components/ui/ChartLine';
import LiveIndicator from '../components/ui/LiveIndicator';
import useSocket from '../hooks/useSocket';
import http from '../api/http';
import endpoints from '../api/endpoints';
import '../styles/theme.css';

/**
 * Dashboard
 * Fetches initial stats via REST and subscribes to /metrics socket namespace for
 * real-time updates. Uses Ocean Professional theme styles. Gracefully degrades
 * when socket is disconnected: continues to render last-known data and shows
 * offline status.
 */
export default function Dashboard() {
  const [feed, setFeed] = useState([]);
  const { connected, subscribe } = useSocket('/metrics');

  // Stats returned by GET /metrics/stats:
  // { count: number, total: number, average: number, latest: [{ value:number, ts?:string }] }
  const [stats, setStats] = useState({ count: 0, total: 0, average: 0, latest: [] });
  // Lightweight time-series for ChartLine: [{x, y}]
  const [chartData, setChartData] = useState([]);

  // Helper to seed/normalize series with zeros for smoother initial rendering
  const makeZeroSeries = (n = 10) => Array.from({ length: n }).map((_, i) => ({ x: i, y: 0 }));

  // Fetch initial stats once on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await http.get(endpoints.metrics.stats);
        // Update stat cards
        setStats({
          count: Number(data?.count ?? 0),
          total: Number(data?.total ?? 0),
          average: Number(data?.average ?? 0),
          latest: Array.isArray(data?.latest) ? data.latest : [],
        });
        // Seed chart with latest values or zeros
        const series = (data?.latest || []).map((m, idx) => ({
          x: idx,
          y: Number(m?.value ?? 0),
        }));
        setChartData(series.length ? series : makeZeroSeries(10));
      } catch {
        // best-effort fallback
        setChartData(makeZeroSeries(10));
      }
    }
    loadStats();
  }, []);

  // Subscribe to live metric:update events
  useEffect(() => {
    const unsub = subscribe('metric:update', (payload) => {
      // payload assumed: { value:number, type?:string, message?:string, ts?:string }
      const value = Number(payload?.value ?? 0);

      // Update event feed (prepend, keep short)
      setFeed((f) => [
        {
          time: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random(),
          ...payload,
        },
        ...f,
      ].slice(0, 15));

      // Update chart series: append new point with incremented x, keep a sliding window
      setChartData((prev) => {
        const lastX = prev.length ? prev[prev.length - 1].x : 0;
        const nextPoint = { x: lastX + 1, y: value };
        const updated = [...prev, nextPoint];
        // Keep last 50 points for performance
        return updated.slice(Math.max(updated.length - 50, 0));
      });

      // Update stat summary live without refetch
      setStats((s) => {
        const latest = Array.isArray(s.latest) ? s.latest : [];
        const nextLatest = [{ value }, ...latest].slice(0, 20);
        const nextCount = (s.count || 0) + 1;
        const nextTotal = (s.total || 0) + value;
        const nextAverage = nextLatest.length
          ? nextLatest.reduce((acc, m) => acc + Number(m.value || 0), 0) / nextLatest.length
          : 0;

        return {
          ...s,
          count: nextCount,
          total: nextTotal,
          average: nextAverage,
          latest: nextLatest,
        };
      });
    });
    return unsub;
  }, [subscribe]);

  const avgDisplay = useMemo(() => (stats.average ? Number(stats.average).toFixed(2) : '0'), [stats.average]);
  const totalDisplay = useMemo(() => String(stats.total || 0), [stats.total]);
  const countDisplay = useMemo(() => String(stats.count || 0), [stats.count]);

  return (
    <div className="page dashboard" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.02) 0%, var(--color-bg) 100%)' }}>
      <div className="dashboard-header" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 className="dashboard-title">Performance Dashboard</h1>
        <div className="dashboard-subtitle muted">Real-time system metrics and monitoring</div>
      </div>

      <div className="grid stats">
        <StatCard title="Samples" value={countDisplay} subtitle="Latest metric samples" icon="📦" />
        <StatCard title="Total Value" value={totalDisplay} subtitle="Sum of latest values" icon="∑" />
        <StatCard title="Average" value={avgDisplay} subtitle="Average of latest values" icon="𝐇" />
        <StatCard title="Live Status" value={connected ? 'Live' : 'Offline'} subtitle="Socket connection" icon="🛰️" />
      </div>

      <div className="grid two">
        <div className="chart-container">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header with-border" style={{ background: 'rgba(37, 99, 235, 0.03)' }}>
              <h3>Performance Metrics</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color primary" style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--color-primary)', borderRadius: 2, marginRight: 6 }}></span>
                  Requests per minute
                </span>
              </div>
            </div>
            <div className="card-content">
              {/* Graceful fallback: chart still renders last-known series even if disconnected */}
              <ChartLine data={chartData} height={300} color={connected ? 'var(--color-primary)' : 'var(--color-border-dark)'} title="Traffic" />
            </div>
          </div>
        </div>

        <div className="card feed-card">
          <div className="card-header with-border" style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
            <div className="feed-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h3>Live Events Feed</h3>
              <LiveIndicator connected={connected} />
            </div>
          </div>
          <div className="card-content">
            <div className="feed-container" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {feed.length > 0 ? (
                <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {feed.map((item) => (
                    <div key={item.id} className="feed-item" style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                      <div className="feed-item-header" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span className="feed-time small muted">{item.time}</span>
                        <span className="badge ok">{item.type || 'INFO'}</span>
                        {!connected && <span className="badge warn">offline</span>}
                      </div>
                      <div className="feed-message">
                        {item.message || `Value: ${item.value ?? ''}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state center" style={{ flexDirection: 'column', gap: 8, padding: 20 }}>
                  <div className="empty-icon" style={{ fontSize: 28 }}>📊</div>
                  <div className="empty-text">Awaiting live events...</div>
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
