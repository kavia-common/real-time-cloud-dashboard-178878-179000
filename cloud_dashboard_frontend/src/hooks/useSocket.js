import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook wrapping Socket.IO client.
 * Reads REACT_APP_SOCKET_URL and exposes connect status and subscribe helper.
 */
export default function useSocket(namespace = '/') {
  const url = process.env.REACT_APP_SOCKET_URL || '';
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(url + namespace, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, namespace]);

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

  return { socket: socketRef.current, connected, subscribe, emit };
}
