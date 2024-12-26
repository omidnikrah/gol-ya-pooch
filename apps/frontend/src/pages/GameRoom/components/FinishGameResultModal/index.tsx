import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import clsx from 'clsx';
import Realistic from 'react-canvas-confetti/dist/presets/realistic';
import { Link } from 'wouter';

export const FinishGameResultModal = () => {
  const { finishGameResult } = useGameStore();

  if (!finishGameResult) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#351351] bg-opacity-60 backdrop-blur-sm z-20">
      <Realistic
        autorun={{ speed: 2, duration: 5000 }}
        className="z-10 absolute inset-0 w-full h-full"
      />
      <div className="w-[450px] px-8 py-16 bg-white rounded-2xl text-center z-20 relative">
        <h3 className="font-black text-2xl text-purple-80">
          تیم{' '}
          <span
            className={clsx({
              'text-blue-team': finishGameResult?.winnerTeam === 'teamA',
              'text-red-team': finishGameResult?.winnerTeam === 'teamB',
            })}
          >
            {finishGameResult?.winnerTeam === 'teamA' ? 'آبی' : 'قرمز'}
          </span>{' '}
          برنده شد.
        </h3>
        <Link
          className="bg-gray-400 text-white px-4 py-2 inline-flex rounded-full text-sm mt-8 font-light cursor-pointer"
          to="/"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
};
