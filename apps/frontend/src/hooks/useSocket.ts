import { socket } from '@gol-ya-pooch/frontend/services';
import { useEffect, useState } from 'react';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const emit = <T>(event: string, data: T) => {
    socket?.emit(event, data);
  };

  const on = <T>(event: string, callback: (data: T) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string) => {
    socket?.off(event);
  };

  return { isConnected, emit, on, off };
};
