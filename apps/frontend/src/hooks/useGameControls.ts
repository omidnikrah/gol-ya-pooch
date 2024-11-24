import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { Events } from '@gol-ya-pooch/shared';
import { useEffect } from 'react';

import { useKeyPress, useSocket } from '.';

export const useGameControls = () => {
  const pressedKey = useKeyPress();
  const { gameState, requestedPlayerIdToEmptyPlay } = useGameStore();
  const { player } = usePlayerStore();
  const { emit } = useSocket();

  useEffect(() => {
    switch (pressedKey) {
      case 'ArrowLeft':
      case 'ArrowRight':
        if (requestedPlayerIdToEmptyPlay === player?.id) {
          emit(Events.PLAYER_PLAYING, {
            playerId: player?.id,
            gameId: gameState?.gameId,
          });
        }
        break;
    }
  }, [pressedKey, gameState]);
};
