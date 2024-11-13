import { Player } from '@gol-ya-pooch/shared';
import { create } from 'zustand';

interface PlayerStore {
  player: Player | null;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  player: null,

  setPlayerData: (data: Player) => set(() => ({ player: data })),
}));
