/**
 * Dashboard - displays key metrics, a chart, and real-time live feed.
 * - Fetches /metrics/stats
 * - Subscribes to Socket.IO 'metric:update' events in /metrics namespace
 * - Ocean Professional styling
 */

import React, { useEffect, useMemo, useState } from 'react';
import http from '../api/http';
import { endpoints } from '../api/endpoints';
import { useSocket } from '../hooks/useSocket';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card.tsx';
import ChartLine from '../components/ui/ChartLine';
import LiveIndicator from '../components/ui/LiveIndicator';

const gradientBg = 'bg-gradient-to-br from-blue-500/10 to-gray-50';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [chartData, setChartData] = useState([]);
  const { socket, connected } = useSocket('/metrics');

  const chartSeries = useMemo(() => {
    return [
      { name: 'Load', data: chartData.map((d) => d.value || d.load || 0) },
    ];
  }, [chartData]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await http.get(endpoints.metrics.stats);
        setStats(res.data || {});
      } catch (e) {
        // noop
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onMetricUpdate = (data) => {
      setLiveFeed((prev) => [data, ...prev].slice(0, 50));
      setChartData((prev) => [...prev, data].slice(-30));
    };
    socket.on('metric:update', onMetricUpdate);
    return () => {
      socket.off('metric:update', onMetricUpdate);
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 ${gradientBg} shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Real-time metrics overview</p>
          </div>
          <LiveIndicator live={connected} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Active Users" value={stats?.activeUsers ?? 0} trend={stats?.activeUsersTrend ?? 0} />
        <StatCard title="Requests/min" value={stats?.rpm ?? 0} trend={stats?.rpmTrend ?? 0} />
        <StatCard title="Errors/min" value={stats?.errors ?? 0} trend={stats?.errorsTrend ?? 0} />
      </div>

      <Card title="System Load (Live)">
        <ChartLine series={chartSeries} height={280} />
      </Card>

      <Card title="Live Activity Feed">
        <div className="space-y-3 max-h-80 overflow-auto pr-2">
          {liveFeed.length === 0 ? (
            <div className="text-gray-500 text-sm">Waiting for live updates...</div>
          ) : (
            liveFeed.map((e, idx) => (
              <div key={idx} className="flex items-center justify-between border-b last:border-b-0 pb-2">
                <div>
                  <div className="font-medium text-gray-800">{e.type || 'metric'}</div>
                  <div className="text-xs text-gray-500">{e.message || JSON.stringify(e)}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(e.timestamp || Date.now()).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
