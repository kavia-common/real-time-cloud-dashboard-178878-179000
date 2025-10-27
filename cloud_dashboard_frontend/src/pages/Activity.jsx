/**
 * Activity - shows recent activity from backend.
 * - Fetches /metrics/activity
 */

import React, { useEffect, useState } from 'react';
import http from '../api/http';
import { endpoints } from '../api/endpoints';
import Card from '../components/ui/Card.tsx';

export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.metrics.activity);
      setItems(res.data || []);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Activity</h1>
      <Card>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500 text-sm">No activity found.</div>
        ) : (
          <ul className="divide-y">
            {items.map((a) => (
              <li key={a._id || `${a.type}-${a.timestamp}`} className="py-3 flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-800">{a.type}</div>
                  <div className="text-xs text-gray-500">{a.message}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(a.timestamp || Date.now()).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
