import { useSocket } from '@gol-ya-pooch/frontend/hooks/useSocket';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { Events, HandPosition, Player } from '@gol-ya-pooch/shared';

export const useEmptyHand = () => {
  const { gameState } = useGameStore();
  const { emit } = useSocket();

  const requestEmptyHand = (
    playerId: Player['id'],
    hand: HandPosition | 'both',
  ) => {
    emit(Events.REQUEST_EMPTY_HAND, {
      gameId: gameState?.gameId,
      playerId,
      hand,
    });
  };

  return {
    requestEmptyHand,
  };
};
