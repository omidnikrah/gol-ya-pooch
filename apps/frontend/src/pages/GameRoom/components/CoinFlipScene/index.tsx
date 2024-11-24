import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useCountdown, useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { convertToPersianNumbers } from '@gol-ya-pooch/frontend/utils';
import { Events, GameState } from '@gol-ya-pooch/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

import { Coin } from '..';

const STARTING_TURN_MESSAGE_TIMEOUT = 3000;
const TRANSITION_CONFIG = {
  type: 'spring',
  damping: 32,
  stiffness: 700,
};

export const CoinFlipScene = () => {
  const countdown = useCountdown({
    from: 3,
  });
  const { gameState, phase, setGameState, setGamePhase } = useGameStore();
  const { emit, on, off } = useSocket();

  useEffect(() => {
    if (phase === GamePhases.FLIPPING_COIN) {
      emit(Events.GAME_COIN_FLIP, {
        gameId: gameState?.gameId,
      });

      on(Events.GAME_COIN_FLIP_RESULT, (data: GameState) => {
        setGameState(data);
        setTimeout(() => {
          setGamePhase(GamePhases.SPREADING_OBJECT);
        }, STARTING_TURN_MESSAGE_TIMEOUT);
      });
      return () => {
        off(Events.GAME_COIN_FLIP_RESULT);
      };
    }
  }, [gameState, phase]);

  return (
    <AnimatePresence>
      {phase === GamePhases.FLIPPING_COIN && (
        <motion.div
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={TRANSITION_CONFIG}
          className="fixed inset-0 bg-purple-80 bg-opacity-90 flex items-center justify-center"
        >
          {countdown > 0 && (
            <AnimatePresence>
              <motion.h1
                key={countdown}
                exit={{ opacity: 0, scale: 3.5, position: 'absolute' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-6xl text-white"
                transition={TRANSITION_CONFIG}
              >
                {convertToPersianNumbers(countdown)}
              </motion.h1>
            </AnimatePresence>
          )}
          {countdown === 0 && <Coin />}
          {countdown === 0 && gameState?.currentTurn && (
            <AnimatePresence>
              <motion.h2
                exit={{ opacity: 0, scale: 3.5, position: 'absolute' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-4xl text-white"
                transition={TRANSITION_CONFIG}
              >
                {gameState?.currentTurn === 'teamA'
                  ? 'تیم آبی بازی رو شروع میکنه'
                  : 'تیم قرمز بازی رو شروع میکنه'}
              </motion.h2>
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
