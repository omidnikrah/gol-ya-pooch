import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export const Coin = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'teamA' | 'teamB' | null>(null);
  const { gameState } = useGameStore();

  useEffect(() => {
    if (gameState?.currentTurn) {
      setIsFlipping(true);

      setTimeout(() => {
        setIsFlipping(false);
        setResult(gameState?.currentTurn);
      }, 1000);
    }
  }, [gameState]);

  return (
    <div className="absolute right-1/2 translate-x-1/2 bottom-20">
      <div
        className={clsx(
          'w-20 h-20 rounded-full bg-purple-80 border-4 border-[#4b396a] flex items-center justify-center perspective-1000 transform-3d',
          {
            'animate-flip': isFlipping,
          },
        )}
      >
        <img
          src="/images/team-b-hands.png"
          alt="team b hands"
          className={clsx('absolute backface-hidden', {
            'rotate-y-0': result && result === 'teamB',
            'rotate-y-180': result && result === 'teamA',
          })}
          width={50}
          height={50}
        />
        <img
          src="/images/team-a-hands.png"
          alt="team a hands"
          className={clsx('absolute backface-hidden rotate-y-180', {
            'rotate-y-180': result && result === 'teamB',
            'rotate-y-0': result && result === 'teamA',
          })}
          width={50}
          height={50}
        />
      </div>
    </div>
  );
};
