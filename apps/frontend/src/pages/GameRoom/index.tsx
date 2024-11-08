import GameTableIcon from './assets/game-table.svg';
import { Player } from './components';

const GameRoomPage = () => {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center relative max-w-[80%]">
        <div className="w-[80%] h-20 absolute top-0 grid grid-cols-3 gap-10 overflow-hidden rotate-180">
          <Player />
          <Player />
          <Player />
        </div>
        <GameTableIcon className="w-full h-auto" />
        <div className="w-[90%] h-20 absolute bottom-0 grid grid-cols-3 gap-10 overflow-hidden">
          <Player />
          <Player />
          <Player />
        </div>
      </div>
    </div>
  );
};

export default GameRoomPage;
