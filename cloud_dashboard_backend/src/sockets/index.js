import { env } from '../config/env.js';
import { Metric } from '../models/Metric.js';

/**
 * Initialize Socket.IO namespaces and events.
 * - /metrics: emits periodic "metric:update" events
 * - /users: placeholder for user-related realtime events (presence, changes)
 */
// PUBLIC_INTERFACE
export function initSockets(io) {
  const metricsNs = io.of('/metrics');
  const usersNs = io.of('/users');

  metricsNs.on('connection', (socket) => {
    console.log('[socket] /metrics connected', socket.id);
    socket.emit('metric:update', { type: 'INFO', message: 'Welcome to metrics stream', timestamp: Date.now() });

    socket.on('disconnect', () => {
      console.log('[socket] /metrics disconnected', socket.id);
    });
  });

  usersNs.on('connection', (socket) => {
    console.log('[socket] /users connected', socket.id);
    socket.on('disconnect', () => {
      console.log('[socket] /users disconnected', socket.id);
    });
  });

  // Example ticker generating demo metric updates and persisting optionally
  setInterval(async () => {
    const value = Math.round(50 + Math.random() * 50);
    const payload = {
      type: 'metric',
      message: 'Metric update received',
      value,
      timestamp: Date.now(),
    };
    metricsNs.emit('metric:update', payload);

    try {
      await Metric.create({ type: 'requests_per_min', value });
    } catch (e) {
      // Avoid crashing on DB issues in skeleton
    }
  }, env.METRIC_TICK_MS);
}
