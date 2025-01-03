import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useSocket, useSound } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { convertToPersianNumbers } from '@gol-ya-pooch/frontend/utils';
import {
  Events,
  gameSize,
  type GameState,
  PrivatePlayerData,
} from '@gol-ya-pooch/shared';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export const JoinGameModal = () => {
  const [selectedGameSize, setSelectedGameSize] = useState<number>(2);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { emit, on, off } = useSocket();
  const [, navigate] = useLocation();
  const { setGameState, setGamePhase } = useGameStore();
  const { setPlayerData } = usePlayerStore();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { play: playJoinSound } = useSound('/sounds/join.mp3');

  useEffect(() => {
    on(Events.GAME_ROOM_JOINED, (roomData: GameState) => {
      setIsLoading(false);
      setGameState(roomData);
      if (roomData) {
        playJoinSound();
        navigate(`/game/${roomData?.gameId}`);
      }
    });

    on(Events.PLAYER_JOINED, (player: PrivatePlayerData) => {
      setPlayerData(player);
      setGamePhase(GamePhases.WAITING_FOR_READY);
    });

    return () => {
      off(Events.GAME_ROOM_JOINED);
      off(Events.PLAYER_JOINED);
    };
  }, []);

  const handleSetGameSize = (size: number) => {
    setSelectedGameSize(size);
  };

  const handleJoinGame = () => {
    setIsLoading(true);

    emit(Events.JOIN_GAME_ROOM, {
      gameSize: selectedGameSize,
    });
  };

  return (
    <>
      <button
        className="mx-4 hover:scale-110 hover:rotate-6 transition-transform"
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        <svg width="182" height="50" viewBox="0 0 182 50">
          <path
            d="M161.081 5.275L23.897 2.209a16 16 0 0 0-14.983 9.507L3.776 23.297c-4.657 10.495 2.93 22.334 14.41 22.488l145.552 1.956c10.858.146 18.704-10.336 15.504-20.713l-3.229-10.472a16 16 0 0 0-14.932-11.281z"
            fill="#DC3C3C"
            stroke="#FFABAB"
            strokeWidth="4"
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="fill-white"
          >
            {t('home.join_game.btn')}
          </text>
        </svg>
      </button>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-[#351351] bg-opacity-60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[450px] p-8 bg-white rounded-2xl text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="font-black text-xl text-primary">
                {t('join_game.modal.title')}
              </h3>
              <div className="my-8 inline-flex shrink-0 bg-secondary-50 rounded-full p-1">
                {gameSize.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={clsx(
                      'px-4 py-2 text-white rounded-full cursor-pointer transition-all duration-200 appearance-none disabled:opacity-30 disabled:cursor-not-allowed',
                      { 'bg-secondary': selectedGameSize === size },
                    )}
                    onClick={() => handleSetGameSize(size)}
                  >
                    {language === 'fa' ? convertToPersianNumbers(size) : size}{' '}
                    {t('game_size.term')}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 justify-center ltr-dir:flex-row-reverse">
                <button
                  className="px-8 py-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-progress"
                  type="button"
                  onClick={handleJoinGame}
                  disabled={isLoading}
                >
                  {t('join_game.modal.join_btn')}
                </button>
                <button
                  className="px-8 py-2 bg-gray-300 text-gray-600 rounded-full"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('join_game.modal.cancel_btn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
