import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import {
  FinishGamePayload,
  Player,
  PlayerFillHand,
  PublicGameState,
} from '@gol-ya-pooch/shared';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameStore {
  gameState: PublicGameState | null;
  phase: GamePhases;
  playingPlayerId: Player['id'] | null;
  requestedPlayerIdToEmptyPlay: Player['id'] | null;
  finishGameResult: FinishGamePayload | null;
  handFillingData: PlayerFillHand | null;

  setGameState: (state: PublicGameState) => void;
  setGamePhase: (phase: GamePhases) => void;
  setPlayingPlayerId: (playerId: Player['id'] | null) => void;
  setRequestedPlayerIdToEmptyPlay: (playerId: Player['id'] | null) => void;
  setFinishGameResult: (gameResult: FinishGamePayload | null) => void;
  setHandFillingData: (handFillingData: PlayerFillHand | null) => void;
}

export const useGameStore = create(
  subscribeWithSelector<GameStore>((set) => ({
    gameState: null,
    phase: GamePhases.WAITING_FOR_PLAYERS,
    playingPlayerId: null,
    requestedPlayerIdToEmptyPlay: null,
    finishGameResult: null,
    handFillingData: null,

    setGameState: (data) => set(() => ({ gameState: data })),
    setGamePhase: (phase) => set(() => ({ phase: phase })),
    setPlayingPlayerId: (playerId) =>
      set(() => ({ playingPlayerId: playerId })),
    setRequestedPlayerIdToEmptyPlay: (playerId) =>
      set(() => ({ requestedPlayerIdToEmptyPlay: playerId })),
    setFinishGameResult: (gameResult) =>
      set(() => ({ finishGameResult: gameResult })),
    setHandFillingData: (handFillingData) => set(() => ({ handFillingData })),
  })),
);

useGameStore.subscribe(
  (state) => state.gameState,
  (gameState) => {
    const gameTeams = gameState?.teams;
    if (!gameTeams) return;

    const teamALength = gameTeams.teamA.members.length;
    const teamBLength = gameTeams.teamB.members.length;

    if (teamALength + teamBLength < gameState.gameSize || gameState.currentTurn)
      return;

    const isTeamAReady = gameTeams.teamA.members.every(
      (player) => player.isReady,
    );
    const isTeamBReady = gameTeams.teamB.members.every(
      (player) => player.isReady,
    );

    if (isTeamAReady && isTeamBReady) {
      useGameStore.getState().setGamePhase(GamePhases.FLIPPING_COIN);
    } else {
      useGameStore.getState().setGamePhase(GamePhases.WAITING_FOR_READY);
    }
  },
);

useGameStore.subscribe(
  (state) => state.playingPlayerId,
  (playingPlayerId) => {
    if (playingPlayerId) {
      setTimeout(() => {
        useGameStore.getState().setPlayingPlayerId(null);
        useGameStore.getState().setRequestedPlayerIdToEmptyPlay(null);
      }, 3000);
    }
  },
);
