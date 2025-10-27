import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * PUBLIC_INTERFACE
 * useSocket
 * A React hook that creates and manages a Socket.IO client connection.
 *
 * Env support:
 * - REACT_APP_SOCKET_URL (required): e.g. https://api.example.com
 * - REACT_APP_SOCKET_PATH (optional): must match backend SOCKET_PATH, defaults to '/socket.io'
 *
 * Namespace support:
 * - Pass a namespace string like '/metrics' or '/notifications'.
 *
 * Exposes:
 * - socket: the underlying socket instance (nullable until connected once)
 * - connected: boolean connection state
 * - connecting: boolean initial/attempting state
 * - error: last connection error if any
 * - subscribe(event, handler): add listener, returns unsubscribe
 * - emit(event, payload): send event
 * - status: 'connecting' | 'connected' | 'disconnected' | 'error'
 * - buffer: bounded in-memory buffer helper with push/get/clear for quick event capture
 */
export default function useSocket(namespace = '/') {
  const baseUrl = process.env.REACT_APP_SOCKET_URL || '';
  const path = process.env.REACT_APP_SOCKET_PATH || '/socket.io';

  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // simple bounded buffer for consumers that want last N events
  const bufferRef = useRef([]);
  const bufferLimitRef = useRef(100);

  const pushToBuffer = useCallback((item) => {
    bufferRef.current = [item, ...bufferRef.current].slice(0, bufferLimitRef.current);
  }, []);

  useEffect(() => {
    if (!baseUrl) {
      setError(new Error('Missing REACT_APP_SOCKET_URL'));
      setConnected(false);
      setConnecting(false);
      return () => {};
    }

    setError(null);
    setConnecting(true);

    // Construct target including namespace to ensure proper namespaced connection.
    const target = `${baseUrl}${namespace}`;
    const socket = io(target, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      path,
      withCredentials: true,
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setConnecting(false);
    };
    const onDisconnect = () => {
      setConnected(false);
      // keep connecting false; socket.io will auto-reconnect
    };
    const onConnectError = (err) => {
      setError(err instanceof Error ? err : new Error(String(err)));
      setConnecting(false);
      setConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, namespace, path]);

  // PUBLIC_INTERFACE
  const subscribe = (event, handler) => {
    /** Subscribes to a socket event; returns unsubscribe function. */
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  // PUBLIC_INTERFACE
  const emit = (event, payload) => {
    /** Emits an event with payload. */
    socketRef.current?.emit(event, payload);
  };

  const status = error ? 'error' : connecting ? 'connecting' : connected ? 'connected' : 'disconnected';

  return {
    socket: socketRef.current,
    connected,
    connecting,
    status,
    error,
    subscribe,
    emit,
    buffer: {
      /** Add an item to the bounded buffer (stored newest-first) */
      push: pushToBuffer,
      /** Get a snapshot copy of the current buffer contents */
      get: () => [...bufferRef.current],
      /** Clear the buffer */
      clear: () => {
        bufferRef.current = [];
      },
      /** Configure maximum buffer length (default 100) */
      setLimit: (n) => {
        const v = Math.max(1, Number(n) || 1);
        bufferLimitRef.current = v;
        bufferRef.current = bufferRef.current.slice(0, v);
      },
    },
  };
}
