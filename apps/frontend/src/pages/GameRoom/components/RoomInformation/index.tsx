import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { convertToPersianNumbers } from '@gol-ya-pooch/frontend/utils';
import clsx from 'clsx';

export const RoomInformation = () => {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  return (
    <div className="fixed top-5 right-5 bg-white rounded-2xl p-4 flex items-center flex-col gap-3">
      {gameState?.currentTurn && (
        <span className="text-sm font-medium text-purple-80">
          توپ دست تیم{' '}
          <span
            className={clsx('font-bold', {
              'text-blue-team': gameState.currentTurn === 'teamA',
              'text-red-team': gameState.currentTurn === 'teamB',
            })}
          >
            {gameState.currentTurn === 'teamA' ? 'آبی' : 'قرمز'}
          </span>
        </span>
      )}
      <span className="text-sm text-purple-80/90">
        راند{' '}
        <span className="font-bold text-purple-80">
          {convertToPersianNumbers(gameState.round)}
        </span>{' '}
        بازی
      </span>
      <span className="w-full h-px bg-purple-80/10" />
      <div className="flex flex-row items-center">
        <div className="flex flex-row px-2 items-center gap-2">
          <img className="size-12" src="/images/team-a-hands.png" alt="" />
          <span className="text-purple-80">
            {convertToPersianNumbers(gameState?.scores?.teamA || 0)}
          </span>
        </div>
        <span className="w-3 h-[2px] bg-purple-80 rounded-full" />
        <div className="flex flex-row-reverse px-2 items-center gap-2">
          <img className="size-12" src="/images/team-b-hands.png" alt="" />
          <span className="text-purple-80">
            {convertToPersianNumbers(gameState?.scores?.teamB || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
