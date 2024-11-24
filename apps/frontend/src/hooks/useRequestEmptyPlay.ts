import { useSocket } from '@gol-ya-pooch/frontend/hooks/useSocket';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { Events, Player } from '@gol-ya-pooch/shared';

export const useRequestEmptyPlay = () => {
  const { gameState } = useGameStore();
  const { emit } = useSocket();

  const requestEmptyPlay = (playerId: Player['id']) => {
    emit(Events.REQUEST_EMPTY_PLAY, {
      gameId: gameState?.gameId,
      playerId: playerId,
    });
  };

  return {
    requestEmptyPlay,
  };
};
