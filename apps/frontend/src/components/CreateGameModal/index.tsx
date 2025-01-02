import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useSocket, useSound } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { convertToPersianNumbers } from '@gol-ya-pooch/frontend/utils';
import { Events, gameSize, PrivatePlayerData } from '@gol-ya-pooch/shared';
import type { GameState } from '@gol-ya-pooch/shared';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

export const CreateGameModal = () => {
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
    on(Events.GAME_ROOM_CREATED, (roomData: GameState) => {
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
      off(Events.GAME_ROOM_CREATED);
      off(Events.PLAYER_JOINED);
    };
  }, []);

  const handleSetGameSize = (size: number) => {
    setSelectedGameSize(size);
  };

  const handleCreateGame = () => {
    setIsLoading(true);

    emit(Events.CREATE_GAME_ROOM, {
      gameSize: selectedGameSize,
    });
  };

  return (
    <>
      <button
        className="mx-4 hover:scale-110 hover:-rotate-6 transition-transform"
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        <svg width="162" height="50" viewBox="0 0 162 50">
          <path
            d="M20.837 5.237l117.844-2.988a16 16 0 0 1 15.306 10.166l4.524 11.565c4.067 10.396-3.494 21.657-14.656 21.827l-125.22 1.91C7.99 47.877.16 37.792 2.952 27.52l2.851-10.487A16 16 0 0 1 20.837 5.237z"
            fill="#48256B"
            stroke="#643890"
            strokeWidth="4"
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="fill-white"
          >
            {t('home.create_game.btn')}
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
                {t('create_game.modal.title')}
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
              <div className="flex gap-2 justify-center">
                <button
                  className="px-8 py-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-progress"
                  type="button"
                  onClick={handleCreateGame}
                  disabled={isLoading}
                >
                  {t('create_game.modal.create_btn')}
                </button>
                <button
                  className="px-8 py-2 bg-gray-300 text-gray-600 rounded-full"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('create_game.modal.cancel_btn')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
