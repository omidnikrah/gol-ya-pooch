import { TeamNames } from '@gol-ya-pooch/shared';
import Spline from '@splinetool/react-spline';
import clsx from 'clsx';

interface IPlayer {
  team: TeamNames;
}

export const Player = ({ team }: IPlayer) => {
  return (
    <div
      className={clsx('w-full h-1/2 bg-purple-80 aspect-square relative flex', {
        'rounded-tr-full rounded-tl-full items-end': team === 'teamA',
        'rounded-br-full rounded-bl-full items-start': team === 'teamB',
      })}
    >
      <Spline
        scene={`/models/${team === 'teamA' ? 'blue' : 'red'}-team-hands.splinecode`}
        className={clsx('absolute flex justify-center !h-[120px]', {
          'translate-y-6': team === 'teamA',
          '-translate-y-6': team === 'teamB',
        })}
      />
    </div>
  );
};
