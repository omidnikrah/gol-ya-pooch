import { Player } from '@gol-ya-pooch/shared';
import { create } from 'zustand';

interface PlayerStore {
  player: Player | null;

  setPlayerData: (state: Player) => void;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  player: null,

  setPlayerData: (data: Player) => set(() => ({ player: data })),
}));
