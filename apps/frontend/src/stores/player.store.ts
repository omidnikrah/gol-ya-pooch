import { IObjectLocation, PrivatePlayerData } from '@gol-ya-pooch/shared';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface PlayerStore {
  player: PrivatePlayerData | null;

  setPlayerData: (state: PrivatePlayerData) => void;
  setObjectLocation: (objectLocation: IObjectLocation) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  immer((set) => ({
    player: null,

    setPlayerData: (data: PrivatePlayerData) => set(() => ({ player: data })),
    setObjectLocation: (objectLocation: IObjectLocation) =>
      set((state) => {
        state.player.objectLocation = objectLocation;
      }),
  })),
);
