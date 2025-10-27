import { env } from '../config/env.js';
import { Metric } from '../models/Metric.js';

/**
 * PUBLIC_INTERFACE
 * Initialize Socket.IO namespaces and events.
 *
 * Namespaces:
 *  - /metrics: emits periodic "metric:update" events every METRIC_TICK_MS
 *    Event payload: { type: string, message: string, value: number, time: ISOString }
 *  - /users: placeholder for user-related realtime events (e.g., presence)
 *
 * Cleanup:
 *  - Returns a function to stop internal timers; server.js may call on shutdown if needed.
 */
export function initSockets(io) {
  const metricsNs = io.of('/metrics');
  const usersNs = io.of('/users');

  metricsNs.on('connection', (socket) => {
    console.log('[socket] /metrics connected', socket.id);
    socket.emit('metric:update', {
      type: 'INFO',
      message: 'Welcome to metrics stream',
      value: 0,
      time: new Date().toISOString()
    });

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

  // Guard interval to a sane value
  const tickMs = Math.max(250, Number(env.METRIC_TICK_MS || 3000));

  // Periodic ticker generating demo metric updates and persisting optionally
  const timer = setInterval(async () => {
    const payload = {
      type: 'INFO',
      message: 'Metric update received',
      value: Math.round(50 + Math.random() * 50),
      time: new Date().toISOString()
    };
    metricsNs.emit('metric:update', payload);

    try {
      // Persist a basic metric record for REST aggregation
      await Metric.create({ type: 'requests_per_min', value: payload.value });
    } catch (e) {
      // Avoid crashing on DB issues in skeleton
    }
  }, tickMs);

  // Ensure timer does not keep process alive inadvertently
  if (typeof timer.unref === 'function') timer.unref();

  // Attach cleanup handlers on process signals (idempotent)
  const cleanup = () => {
    try {
      clearInterval(timer);
    } catch {
      /* noop */
    }
  };

  process.once('SIGINT', cleanup);
  process.once('SIGTERM', cleanup);

  // Return cleanup function for manual invocation if needed
  return cleanup;
}
