import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/ui/StatCard';
import ChartLine from '../components/ui/ChartLine';
import useSocket from '../hooks/useSocket';
import '../styles/theme.css';

export default function Dashboard() {
  const [feed, setFeed] = useState([]);
  const { connected, subscribe } = useSocket('/metrics');

  useEffect(() => {
    // Mock subscription; backend can emit 'metric:update'
    const unsub = subscribe('metric:update', (payload) => {
      setFeed((f) => [{ time: new Date().toLocaleTimeString(), ...payload }, ...f].slice(0, 10));
    });
    return unsub;
  }, [subscribe]);

  const chartData = useMemo(() => {
    // Mock line data
    return Array.from({ length: 20 }).map((_, i) => ({ x: i, y: Math.round(50 + 20 * Math.sin(i / 2)) }));
  }, []);

  return (
    <div className="page">
      <div className="grid stats">
        <StatCard title="Active Users" value="128" subtitle="+12% WoW" icon="👤" />
        <StatCard title="Requests/min" value="3,482" subtitle="+4%" icon="⚡" />
        <StatCard title="Error Rate" value="0.7%" subtitle="-0.2%" icon="🧪" />
        <StatCard title="Latency p95" value="220ms" subtitle="-15ms" icon="⏱️" />
      </div>

      <div className="grid two">
        <ChartLine data={chartData} />
        <div className="card">
          <div className="card-header">
            <span>Live Feed</span>
            <span className={`badge ${connected ? 'ok' : 'warn'}`}>{connected ? 'Live' : 'Offline'}</span>
          </div>
          <div className="feed">
            {feed.length ? feed.map((item, idx) => (
              <div key={idx} className="feed-item">
                <span className="time">{item.time}</span>
                <span className="msg">{item.message || 'Metric update received'}</span>
              </div>
            )) : (
              <div className="muted">Awaiting live events...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
