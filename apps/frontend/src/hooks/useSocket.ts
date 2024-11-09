import { socket } from '@gol-ya-pooch/frontend/services';
import { Events } from '@gol-ya-pooch/shared';
import { useEffect, useState } from 'react';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleGameException = (err: { status: string; message: string }) =>
      setError(err.message);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(Events.GAME_EXCEPTION, handleGameException);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(Events.GAME_EXCEPTION);
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

  return { isConnected, emit, on, off, error };
};
