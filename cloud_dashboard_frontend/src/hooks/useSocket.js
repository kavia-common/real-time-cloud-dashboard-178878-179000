/**
 * useSocket - Hook to manage Socket.IO connection for real-time metrics.
 * Connects to the /metrics namespace using env-configured URL and path.
 *
 * Env:
 * - REACT_APP_SOCKET_URL (e.g., http://localhost:4000)
 * - REACT_APP_SOCKET_PATH (default: /socket.io)
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || '/socket.io';

// PUBLIC_INTERFACE
export function useSocket(namespace = '/metrics', opts = {}) {
  /**
   * Connect to a Socket.IO namespace with options.
   * Returns { socket, connected, error }.
   */
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}${namespace}`, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      ...opts,
    });
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err) => setError(err);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.close();
    };
  }, [namespace, opts]);

  return { socket: socketRef.current, connected, error };
}
