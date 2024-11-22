import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { PublicGameState } from '@gol-ya-pooch/shared';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameStore {
  gameState: PublicGameState | null;
  phase: GamePhases;

  setGameState: (state: PublicGameState) => void;
  setGamePhase: (phase: GamePhases) => void;
}

export const useGameStore = create(
  subscribeWithSelector<GameStore>((set) => ({
    gameState: null,
    phase: GamePhases.WAITING_FOR_PLAYERS,

    setGameState: (data: PublicGameState) => set(() => ({ gameState: data })),
    setGamePhase: (phase: GamePhases) => set(() => ({ phase: phase })),
  })),
);

useGameStore.subscribe(
  (state) => state.gameState,
  (gameState) => {
    const gameTeams = gameState?.teams;
    if (!gameTeams) return;

    const teamALength = gameTeams.teamA.members.length;
    const teamBLength = gameTeams.teamB.members.length;

    if (teamALength + teamBLength < gameState.gameSize) return;

    const isTeamAReady = gameTeams.teamA.members.every(
      (player) => player.isReady,
    );
    const isTeamBReady = gameTeams.teamB.members.every(
      (player) => player.isReady,
    );

    if (isTeamAReady && isTeamBReady) {
      useGameStore.getState().setGamePhase(GamePhases.COIN_FLIP);
    }
  },
);
