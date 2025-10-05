import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      return () => {
        // Don't disconnect on unmount, keep socket alive
        // socketService.disconnect();
      };
    } else {
      if (socket) {
        socketService.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  return {
    socket,
    connected,
    emit: (event, data) => socketService.emit(event, data),
    on: (event, callback) => socketService.on(event, callback),
    off: (event, callback) => socketService.off(event, callback)
  };
};

export default useSocket;