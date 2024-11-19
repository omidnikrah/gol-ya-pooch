import { GameInfo, GameState } from '@gol-ya-pooch/shared';
import { create } from 'zustand';

interface GameStore {
  gameState: GameState | GameInfo | null;

  setGameState: (state: GameState | GameInfo) => void;
}

export const useGameStore = create<GameStore>()((set) => ({
  gameState: null,

  setGameState: (data: GameState | GameInfo) =>
    set(() => ({ gameState: data })),
}));
