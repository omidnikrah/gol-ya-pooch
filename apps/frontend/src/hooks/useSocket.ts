import { socket } from '@gol-ya-pooch/frontend/services';
import { Events } from '@gol-ya-pooch/shared';
import { useEffect, useState } from 'react';

type ExceptionError = { type: string; status?: string; message: string };

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [error, setError] = useState<ExceptionError>();

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleGameException = (err: ExceptionError) => setError(err);

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
