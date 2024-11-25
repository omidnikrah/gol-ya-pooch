import { useToast } from '@gol-ya-pooch/frontend/components';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { Events, PublicGameState } from '@gol-ya-pooch/shared';
import { useEffect } from 'react';

import { useKeyPress, useSocket } from '.';

export const useGameControls = () => {
  const { gameState, requestedPlayerIdToEmptyPlay, setGameState } =
    useGameStore();
  const { player } = usePlayerStore();
  const { emit, on, off } = useSocket();
  const { showToast } = useToast();

  useKeyPress(['ArrowLeft', 'ArrowRight'], () => {
    if (requestedPlayerIdToEmptyPlay === player?.id) {
      emit(Events.PLAYER_PLAYING, {
        playerId: player?.id,
        gameId: gameState?.gameId,
      });
    }
  });

  useEffect(() => {
    if (requestedPlayerIdToEmptyPlay === player?.id) {
      showToast('شما باید خالی بازی کنید', 5000);
    }
  }, [requestedPlayerIdToEmptyPlay, player]);

  useEffect(() => {
    on(Events.GAME_STATE_UPDATED, (data: PublicGameState) => {
      setGameState(data);
    });

    return () => {
      off(Events.GAME_STATE_UPDATED);
    };
  }, []);

  return null;
};
