import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (url = 'http://localhost:5000') => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[WebSocket] Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('[WebSocket] Welcome message:', data);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [url]);

  const subscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const unsubscribe = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
    emit
  };
};