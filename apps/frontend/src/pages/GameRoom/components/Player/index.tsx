import {
  useGuessHand,
  useRequestEmptyPlay,
} from '@gol-ya-pooch/frontend/hooks';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import {
  HandPosition,
  Player as IPlayerData,
  TeamNames,
} from '@gol-ya-pooch/shared';
import Spline from '@splinetool/react-spline';
import clsx from 'clsx';
import { useMemo } from 'react';

interface IPlayer {
  team: TeamNames;
  data: IPlayerData | null;
  isJoined: boolean;
  position: 'top' | 'bottom';
}

export const Player = ({ team, data, isJoined, position }: IPlayer) => {
  const { playingPlayerId, gameState } = useGameStore();
  const { requestEmptyPlay } = useRequestEmptyPlay();
  const { guessObjectLocation } = useGuessHand();

  const isPlaying = playingPlayerId === data?.id;

  const handleRequestEmptyPlay = () => {
    if (data?.id) {
      requestEmptyPlay(data?.id);
    }
  };

  const handleGuessObject = (hand: HandPosition) => {
    if (data?.id) {
      guessObjectLocation(data?.id, hand);
    }
  };

  const splineFilePath = useMemo(() => {
    const shouldHandsOpen =
      !gameState?.currentTurn || team !== gameState?.currentTurn;
    return `/models/${team === 'teamA' ? 'blue' : 'red'}-${position}-team-hands${isPlaying ? '-playing' : ''}${shouldHandsOpen ? '-open' : ''}.splinecode`;
  }, [team, position, isPlaying, gameState]);

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
          scene={splineFilePath}
          className={clsx('absolute flex justify-center !h-[120px]', {
            'translate-y-6': position === 'bottom',
            '-translate-y-6': position === 'top',
          })}
        />
      )}
      {gameState?.currentTurn === team && position !== 'bottom' && (
        <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 flex-col">
          <button
            type="button"
            className="px-4 py-2 rounded-full appearance-none border-none border-0 bg-primary text-sm text-[#541718] translate-y-4"
            onClick={handleRequestEmptyPlay}
          >
            درخواست خالی بازی
          </button>
          <div className="gap-2 flex">
            <button
              type="button"
              className="px-4 py-2 rounded-full appearance-none border-none border-0 bg-[#d1754d] text-sm text-[#61291a] translate-y-4 hover:scale-110 transition-all"
              onClick={() => handleGuessObject('left')}
            >
              چپ گل
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full appearance-none border-none border-0 bg-[#d1754d] text-sm text-[#61291a] translate-y-4 hover:scale-110 transition-all"
              onClick={() => handleGuessObject('right')}
            >
              راست گل
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
