import { useSocket } from '@gol-ya-pooch/frontend/hooks';
import { Events } from '@gol-ya-pooch/shared';
import { useEffect } from 'react';
import { useParams } from 'wouter';

import GameTableIcon from './assets/game-table.svg';
import { Player } from './components';

const GameRoomPage = () => {
  const params = useParams();
  const { on, emit, off, error } = useSocket();

  useEffect(() => {
    emit(Events.GET_ROOM_INFO, {
      gameId: params.gameId,
    });

    on(Events.ROOM_INFO_FETCHED, (data) => {
      console.log(data);
    });

    return () => {
      off(Events.ROOM_INFO_FETCHED);
    };
  }, [params.gameId]);

  console.log(error);

  return (
    <div className="flex justify-center">
      <div className="flex justify-center relative max-w-[1000px]">
        <div className="w-[80%] absolute top-0 grid grid-cols-3 gap-10 items-start">
          <Player team="teamB" />
          <Player team="teamB" />
          <Player team="teamB" />
        </div>
        <GameTableIcon className="w-full h-auto" />
        <div className="w-[90%] absolute bottom-0 grid grid-cols-3 gap-10 items-end">
          <Player team="teamA" />
          <Player team="teamA" />
          <Player team="teamA" />
        </div>
      </div>
    </div>
  );
};

export default GameRoomPage;
