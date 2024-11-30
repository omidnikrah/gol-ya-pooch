import { useSocket } from '@gol-ya-pooch/frontend/hooks/useSocket';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { Events, HandPosition, Player } from '@gol-ya-pooch/shared';

export const useGuessHand = () => {
  const { gameState } = useGameStore();
  const { emit } = useSocket();

  const guessObjectLocation = (playerId: Player['id'], hand: HandPosition) => {
    emit(Events.GUESS_OBJECT_LOCATION, {
      gameId: gameState?.gameId,
      playerId,
      hand,
    });
  };

  return {
    guessObjectLocation,
  };
};
