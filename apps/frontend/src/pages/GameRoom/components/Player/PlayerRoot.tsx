import { Player, TeamNames } from '@gol-ya-pooch/shared';
import clsx from 'clsx';
import { ReactNode } from 'react';

import { PlayerContext } from './PlayerContext';

interface IPlayerRoot {
  data: Player | null;
  position: 'top' | 'bottom';
  team: TeamNames;
  children?: ReactNode;
}

export const PlayerRoot = ({ data, position, team, children }: IPlayerRoot) => {
  return (
    <PlayerContext.Provider value={{ data, position, team }}>
      <div
        data-id={data?.id}
        className={clsx(
          'group w-full h-1/2 bg-purple-80 aspect-square relative flex justify-center',
          {
            'rounded-tr-full rounded-tl-full items-end': position === 'bottom',
            'rounded-br-full rounded-bl-full items-start': position === 'top',
          },
        )}
      >
        {children}
      </div>
    </PlayerContext.Provider>
  );
};
