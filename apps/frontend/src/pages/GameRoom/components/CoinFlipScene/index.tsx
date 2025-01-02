import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useCountdown, useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore } from '@gol-ya-pooch/frontend/stores';
import { convertToPersianNumbers } from '@gol-ya-pooch/frontend/utils';
import { Events, GameState } from '@gol-ya-pooch/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Coin } from '..';

const STARTING_TURN_MESSAGE_TIMEOUT = 7000;
const TRANSITION_CONFIG = {
  type: 'spring',
  damping: 32,
  stiffness: 700,
};

export const CoinFlipScene = () => {
  const { gameState, phase, setGameState, setGamePhase } = useGameStore();
  const countdown = useCountdown({
    from: 3,
    enable: phase === GamePhases.FLIPPING_COIN,
  });
  const { emit, on, off } = useSocket();
  const {
    t,
    i18n: { language },
  } = useTranslation();

  useEffect(() => {
    if (phase === GamePhases.FLIPPING_COIN && !gameState?.currentTurn) {
      emit(Events.GAME_COIN_FLIP, {
        gameId: gameState?.gameId,
      });

      on(Events.GAME_COIN_FLIP_RESULT, (data: GameState) => {
        setGameState(data);
        setTimeout(() => {
          if (data.gameSize > 2) {
            setGamePhase(GamePhases.SPREADING_OBJECT);
          } else {
            setGamePhase(GamePhases.PLAYING);
          }
        }, STARTING_TURN_MESSAGE_TIMEOUT);
      });
      return () => {
        off(Events.GAME_COIN_FLIP_RESULT);
      };
    }
  }, [gameState?.gameId, phase]);

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={TRANSITION_CONFIG}
        className="fixed inset-0 bg-purple-80 bg-opacity-90 flex items-center justify-center z-20"
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
              {language === 'fa'
                ? convertToPersianNumbers(countdown)
                : countdown}
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
              {t('starting_team.message', {
                teamColor: t(
                  gameState?.currentTurn === 'teamA'
                    ? 'teamAColor'
                    : 'teamBColor',
                ),
              })}
            </motion.h2>
          </AnimatePresence>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
