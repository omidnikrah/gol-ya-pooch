import type { Player as IPlayerData, TeamNames } from '@gol-ya-pooch/shared';
import Spline from '@splinetool/react-spline';
import clsx from 'clsx';

interface IPlayer {
  team: TeamNames;
  data: IPlayerData | null;
  isJoined: boolean;
  position: 'top' | 'bottom';
}

export const Player = ({ team, data, isJoined, position }: IPlayer) => {
  return (
    <div
      className={clsx('w-full h-1/2 bg-purple-80 aspect-square relative flex', {
        'rounded-tr-full rounded-tl-full items-end': position === 'bottom',
        'rounded-br-full rounded-bl-full items-start': position === 'top',
      })}
    >
      {data?.name}
      {isJoined && (
        <Spline
          scene={`/models/${team === 'teamA' ? 'blue' : 'red'}-${position}-team-hands.splinecode`}
          className={clsx('absolute flex justify-center !h-[120px]', {
            'translate-y-6': position === 'bottom',
            '-translate-y-6': position === 'top',
          })}
        />
      )}
    </div>
  );
};
