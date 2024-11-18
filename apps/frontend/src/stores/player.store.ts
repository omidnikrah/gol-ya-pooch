import { PlayerWithTeam } from '@gol-ya-pooch/shared';
import { create } from 'zustand';

interface PlayerStore {
  player: PlayerWithTeam | null;

  setPlayerData: (state: PlayerWithTeam) => void;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  player: null,

  setPlayerData: (data: PlayerWithTeam) => set(() => ({ player: data })),
}));
