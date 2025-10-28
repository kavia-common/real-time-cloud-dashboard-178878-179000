import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { TOKEN_STORAGE_KEY } from '../api/http';

// PUBLIC_INTERFACE
export default function useSocket(namespace = '/metrics') {
  /** Connects to Socket.IO using env REACT_APP_SOCKET_URL and REACT_APP_SOCKET_PATH.
   *  Returns { socket, connected, subscribe } and auto-disconnects on unmount.
   */
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const url = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
    const path = process.env.REACT_APP_SOCKET_PATH || '/socket.io';
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    const socket = io(url + namespace, {
      path,
      transports: ['websocket', 'polling'],
      auth: token ? { token: `Bearer ${token}` } : undefined,
    });

    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      try {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.disconnect();
      } catch {
        // ignore
      }
    };
  }, [namespace]);

  const subscribe = (event, handler) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  return { socket: socketRef.current, connected, subscribe };
}
