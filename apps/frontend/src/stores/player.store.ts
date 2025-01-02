import { IObjectLocation, PrivatePlayerData } from '@gol-ya-pooch/shared';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface PlayerStore {
  player: PrivatePlayerData | null;

  setPlayerData: (state: PrivatePlayerData) => void;
  setObjectLocation: (objectLocation: IObjectLocation | null) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  immer((set) => ({
    player: null,

    setPlayerData: (data) => set(() => ({ player: data })),
    setObjectLocation: (objectLocation) =>
      set((state) => {
        if (state.player) {
          state.player.objectLocation = objectLocation;
        }
      }),
  })),
);
