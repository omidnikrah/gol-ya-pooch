import { useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { Events, GameState, PlayerWithTeam } from '@gol-ya-pooch/shared';
import { useEffect } from 'react';

export const ReadyButton = () => {
  const { gameState, setGameState } = useGameStore();
  const { player, setPlayerData } = usePlayerStore();
  const { emit, on, off } = useSocket();

  useEffect(() => {
    on(Events.PLAYER_READY_CONFIRMED, (playerData: PlayerWithTeam) => {
      setPlayerData(playerData);
    });

    on(Events.GAME_STATE_UPDATED, (data: GameState) => {
      setGameState(data);
    });

    return () => {
      off(Events.PLAYER_READY_CONFIRMED);
      off(Events.GAME_STATE_UPDATED);
    };
  }, []);

  const handleReadyPlayer = () => {
    emit(Events.PLAYER_READY, {
      gameId: gameState?.gameId,
      playerId: player?.id,
      team: player?.team,
    });
  };

  if (!player || player?.isReady) return null;

  return (
    <button
      type="button"
      className="fixed bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-primary px-8 py-3 border-4 border-primary-50 text-[#641b1b]"
      onClick={handleReadyPlayer}
    >
      آماده شروع بازی
    </button>
  );
};
