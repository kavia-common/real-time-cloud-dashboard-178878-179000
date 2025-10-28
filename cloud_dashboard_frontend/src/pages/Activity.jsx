import React, { useEffect, useState } from 'react';
import { apiMetrics } from '../api/endpoints';

export default function Activity() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const { data } = await apiMetrics.activity();
      setItems(data?.activity || data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Recent Activity</h1>
      <div className="bg-white rounded-lg shadow divide-y">
        {items.length === 0 && <div className="p-4 text-gray-500">No recent activity.</div>}
        {items.map((a) => (
          <div key={a._id || `${a.type}-${a.createdAt}`} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.type}</div>
              <div className="text-sm text-gray-500">{a.message}</div>
            </div>
            <div className="text-sm text-gray-400">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
