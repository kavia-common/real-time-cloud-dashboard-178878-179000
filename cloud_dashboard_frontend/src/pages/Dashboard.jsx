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
      setFeed((f) => [{ 
        time: new Date().toLocaleTimeString(), 
        id: Date.now() + Math.random(),
        ...payload 
      }, ...f].slice(0, 15));
    });
    return unsub;
  }, [subscribe]);

  const chartData = useMemo(() => {
    // Mock line data
    return Array.from({ length: 20 }).map((_, i) => ({ 
      x: i, 
      y: Math.round(50 + 20 * Math.sin(i / 2)) 
    }));
  }, []);

  return (
    <div className="page dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Performance Dashboard</h1>
        <div className="dashboard-subtitle">Real-time system metrics and monitoring</div>
      </div>

      {/* Stats Grid */}
      <div className="grid stats">
        <StatCard 
          title="Active Users" 
          value="128" 
          subtitle="+12% WoW" 
          icon="👤" 
          trend="up"
        />
        <StatCard 
          title="Requests/min" 
          value="3,482" 
          subtitle="+4%" 
          icon="⚡" 
          trend="up"
        />
        <StatCard 
          title="Error Rate" 
          value="0.7%" 
          subtitle="-0.2%" 
          icon="🧪" 
          trend="down"
        />
        <StatCard 
          title="Latency p95" 
          value="220ms" 
          subtitle="-15ms" 
          icon="⏱️" 
          trend="down"
        />
      </div>

      {/* Charts Section */}
      <div className="grid two">
        <div className="chart-container">
          <div className="card">
            <div className="card-header with-border">
              <h3>Performance Metrics</h3>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color primary"></span>
                  Response Time
                </span>
              </div>
            </div>
            <div className="card-content">
              <ChartLine data={chartData} height={300} />
            </div>
          </div>
        </div>

        {/* Live Feed */}
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
                        {item.message || 'Metric update received'}
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