import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/ui/StatCard';
import ChartLine from '../components/ui/ChartLine';
import LiveIndicator from '../components/ui/LiveIndicator';
import useSocket from '../hooks/useSocket';
import { apiMetrics } from '../api/endpoints';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, activeUsers: 0, requests: 0, errors: 0 });
  const [series, setSeries] = useState([]);
  const { connected, subscribe } = useSocket('/metrics');

  const loadStats = async () => {
    try {
      const { data } = await apiMetrics.stats();
      setStats(data?.stats || data || {});
      setSeries(data?.series || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const unsub = subscribe('metric:update', (payload) => {
      if (payload?.stats) {
        setStats((prev) => ({ ...prev, ...payload.stats }));
      }
      if (payload?.seriesPoint) {
        setSeries((prev) => [...prev.slice(-49), payload.seriesPoint]);
      }
    });
    return unsub;
  }, [subscribe]);

  const cards = useMemo(
    () => [
      { label: 'Users', value: stats.users ?? 0 },
      { label: 'Active', value: stats.activeUsers ?? 0 },
      { label: 'Requests', value: stats.requests ?? 0 },
      { label: 'Errors', value: stats.errors ?? 0 },
    ],
    [stats]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <LiveIndicator active={connected} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} title={c.label} value={c.value} />
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Traffic (Live)</h2>
        <ChartLine data={series} />
      </div>
    </div>
  );
}
