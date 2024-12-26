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
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export const JoinGameModal = () => {
  const [selectedGameSize, setSelectedGameSize] = useState<number>(2);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { emit, on, off } = useSocket();
  const [, navigate] = useLocation();
  const { setGameState, setGamePhase } = useGameStore();
  const { setPlayerData } = usePlayerStore();
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
            جوین خودکار به بازی
          </text>
        </svg>
      </button>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#351351] bg-opacity-60 backdrop-blur-sm">
          <div className="w-[450px] p-8 bg-white rounded-2xl text-center">
            <h3 className="font-black text-xl text-primary">
              بازی چند نفره ببرمت؟
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
                  {convertToPersianNumbers(size)} نفره
                </button>
              ))}
            </div>
            <div>
              <button
                className="px-8 py-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-progress"
                type="button"
                onClick={handleJoinGame}
                disabled={isLoading}
              >
                جوین به بازی
              </button>
              <button
                className="px-8 py-2 bg-gray-300 text-gray-600 rounded-full mr-2"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                بیخیال
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
