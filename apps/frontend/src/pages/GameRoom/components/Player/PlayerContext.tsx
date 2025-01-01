import { Player, TeamNames } from '@gol-ya-pooch/shared';
import { createContext, useContext } from 'react';

interface IPlayerContext {
  data: Player | null;
  position: 'top' | 'bottom';
  team: TeamNames;
}

export const PlayerContext = createContext<IPlayerContext | undefined>(
  undefined,
);

export const usePlayerContext = (): IPlayerContext => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('Player component must be used within a Player.Root');
  }
  return context;
};
