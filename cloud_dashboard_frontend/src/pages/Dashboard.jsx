import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/ui/StatCard';
import ChartLine from '../components/ui/ChartLine';
import useSocket from '../hooks/useSocket';
import http from '../api/http';
import endpoints from '../api/endpoints';
import '../styles/theme.css';

export default function Dashboard() {
  const [feed, setFeed] = useState([]);
  const { connected, subscribe } = useSocket('/metrics');

  const [stats, setStats] = useState({ count: 0, total: 0, average: 0, latest: [] });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const unsub = subscribe('metric:update', (payload) => {
      setFeed((f) => [{
        time: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random(),
        ...payload
      }, ...f].slice(0, 15));
    });
    return unsub;
  }, [subscribe]);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data } = await http.get(endpoints.metrics.stats);
        setStats(data);
        const series = (data.latest || []).map((m, idx) => ({
          x: idx,
          y: Number(m.value || 0)
        }));
        setChartData(series.length ? series : Array.from({ length: 10 }).map((_, i) => ({ x: i, y: 0 })));
      } catch {
        // best-effort
      }
    }
    loadStats();
  }, []);

  const avgDisplay = useMemo(() => (stats.average ? stats.average.toFixed(2) : '0'), [stats.average]);
  const totalDisplay = useMemo(() => String(stats.total || 0), [stats.total]);
  const countDisplay = useMemo(() => String(stats.count || 0), [stats.count]);

  return (
    <div className="page dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Performance Dashboard</h1>
        <div className="dashboard-subtitle">Real-time system metrics and monitoring</div>
      </div>

      <div className="grid stats">
        <StatCard title="Samples" value={countDisplay} subtitle="Latest metric samples" icon="📦" />
        <StatCard title="Total Value" value={totalDisplay} subtitle="Sum of latest values" icon="∑" />
        <StatCard title="Average" value={avgDisplay} subtitle="Average of latest values" icon="𝜇" />
        <StatCard title="Live Status" value={connected ? 'Live' : 'Offline'} subtitle="Socket connection" icon="🛰️" />
      </div>

      <div className="grid two">
        <div className="chart-container">
          <div className="card">
            <div className="card-header with-border">
              <h3>Performance Metrics</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color primary"></span>
                  Requests per minute
                </span>
              </div>
            </div>
            <div className="card-content">
              <ChartLine data={chartData} height={300} />
            </div>
          </div>
        </div>

        <div className="card feed-card">
          <div className="card-header with-border">
            <div className="feed-header">
              <h3>Live Events Feed</h3>
              <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                <span className={`status-dot ${connected ? 'pulse' : ''}`}></span>
                {connected ? 'Live' : 'Offline'}
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="feed-container">
              {feed.length > 0 ? (
                <div className="feed-list">
                  {feed.map((item) => (
                    <div key={item.id} className="feed-item">
                      <div className="feed-item-header">
                        <span className="feed-time">{item.time}</span>
                        <span className="feed-type">{item.type || 'INFO'}</span>
                      </div>
                      <div className="feed-message">
                        {item.message || `Value: ${item.value ?? ''}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <div className="empty-text">Awaiting live events...</div>
                  <div className="empty-subtext">Events will appear here in real-time</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}