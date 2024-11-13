import { GameState } from '@gol-ya-pooch/shared';
import { create } from 'zustand';

interface GameStore {
  gameState: GameState | null;

  setGameState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>()((set) => ({
  gameState: null,

  setGameState: (data: GameState) => set(() => ({ gameState: data })),
}));
