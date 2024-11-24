import { useRequestEmptyPlay } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { Player as IPlayerData, TeamNames } from '@gol-ya-pooch/shared';
import Spline from '@splinetool/react-spline';
import clsx from 'clsx';

interface IPlayer {
  team: TeamNames;
  data: IPlayerData | null;
  isJoined: boolean;
  position: 'top' | 'bottom';
}

export const Player = ({ team, data, isJoined, position }: IPlayer) => {
  const { playingPlayerId, gameState } = useGameStore();
  const { requestEmptyPlay } = useRequestEmptyPlay();

  const isPlaying = playingPlayerId === data?.id;

  const handleRequestEmptyPlay = () => {
    if (data?.id) {
      requestEmptyPlay(data?.id);
    }
  };

  return (
    <div
      className={clsx(
        'group w-full h-1/2 bg-purple-80 aspect-square relative flex justify-center',
        {
          'rounded-tr-full rounded-tl-full items-end': position === 'bottom',
          'rounded-br-full rounded-bl-full items-start': position === 'top',
        },
      )}
    >
      {data?.isReady && (
        <span
          className={clsx(
            'absolute translate-x-1/2 right-1/2 bg-green-300 text-green-800 px-4 py-1 rounded-full',
            {
              'translate-y-14': position === 'bottom',
              '-translate-y-14': position === 'top',
            },
          )}
        >
          آماده
        </span>
      )}
      {data?.name}
      {isJoined && (
        <Spline
          scene={`/models/${team === 'teamA' ? 'blue' : 'red'}-${position}-team-hands${isPlaying ? '-playing' : ''}.splinecode`}
          className={clsx('absolute flex justify-center !h-[120px]', {
            'translate-y-6': position === 'bottom',
            '-translate-y-6': position === 'top',
          })}
        />
      )}
      {gameState?.currentTurn === team && position !== 'bottom' && (
        <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="px-4 py-2 rounded-full appearance-none border-none border-0 bg-primary text-sm text-[#541718] translate-y-4"
            onClick={handleRequestEmptyPlay}
          >
            درخواست خالی بازی
          </button>
        </div>
      )}
    </div>
  );
};
