import { JoinGameModal } from '@gol-ya-pooch/frontend/components';
import { useSocket } from '@gol-ya-pooch/frontend/hooks';
import { Events } from '@gol-ya-pooch/shared';
import { useEffect } from 'react';

import CircleIcon from './assets/circle-icon.svg';
import FlowerIcon from './assets/flower-icon.svg';
import NineIcon from './assets/nine-icon.svg';
import StairsIcon from './assets/stairs-icon.svg';

const HomePage = () => {
  const { emit, on } = useSocket();

  const handleCreateRoom = () => {
    emit(Events.CREATE_GAME_ROOM, {});
  };

  useEffect(() => {
    on(Events.GAME_ROOM_CREATED, (data) => {
      console.log('created => ', data);
    });
  }, []);

  return (
    <>
      <div className="text-center">
        <div className="absolute -top-32 w-56 h-56 rotate-45 rounded-[40px] bg-gradient-to-br from-[#201A32] to-[rgba(32, 26, 50, 0)] translate-x-1/2 right-1/2" />
        <div className="opacity-15 -z-10">
          <FlowerIcon className="absolute top-[8%] left-[10%] animate-move-top-left" />
          <NineIcon className="absolute top-[10%] right-[10%] animate-move-top-right" />
          <CircleIcon className="absolute bottom-[12%] left-[15%] animate-move-bottom-left" />
          <StairsIcon className="absolute bottom-[10%] right-[15%] animate-move-bottom-right" />
        </div>
        <h1 className="font-extra-black text-7xl text-primary">
          گل <span className="text-primary-50">یا</span> پــوچ؟
        </h1>
        <span className="font-extra-bold text-l text-purple-white mt-8 block">
          گل یا پوچ آنلاین دیدی؟ بیا بازی کنیم و ببینی پس اینکاره نیستی!
        </span>
        <div className="mt-24">
          <JoinGameModal />

          <button
            className="mx-4 hover:scale-110 hover:-rotate-6 transition-transform"
            type="button"
            onClick={handleCreateRoom}
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
                ساخت بازی جدید
              </text>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
