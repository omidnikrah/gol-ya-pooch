import { useSocket } from '@gol-ya-pooch/frontend/hooks';
import { Events, GameInfo } from '@gol-ya-pooch/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';

import GameTableIcon from './assets/game-table.svg';
import { Player } from './components';

const GameRoomPage = () => {
  const params = useParams();
  const { on, emit, off, error } = useSocket();
  const [gameRoomData, setGameRoomData] = useState<GameInfo>();

  useEffect(() => {
    emit(Events.GET_ROOM_INFO, {
      gameId: params.gameId,
    });

    on(Events.ROOM_INFO_FETCHED, (data: GameInfo) => {
      setGameRoomData(data);
    });

    return () => {
      off(Events.ROOM_INFO_FETCHED);
    };
  }, [params.gameId]);

  console.log(gameRoomData, error);

  const gameSize = gameRoomData ? gameRoomData.gameSize / 2 : 0;

  return (
    <div className="flex justify-center">
      <div className="flex justify-center relative max-w-[1000px]">
        <div className="w-[80%] absolute top-0 grid grid-cols-3 gap-10 items-start">
          {Array.from({ length: Number(gameSize) }).map((_, index) => {
            const member = gameRoomData?.teams.teamB.members[index];

            return (
              <Player
                key={member?.id || `player-loading-${index}`}
                data={member || null}
                isJoined={!!member}
                team="teamB"
              />
            );
          })}
        </div>
        <GameTableIcon className="w-full h-auto" />
        <div className="w-[90%] absolute bottom-0 grid grid-cols-3 gap-10 items-end">
          {Array.from({ length: Number(gameSize) }).map((_, index) => {
            const member = gameRoomData?.teams.teamA.members[index];

            return (
              <Player
                key={member?.id || `player-loading-${index}`}
                data={member || null}
                isJoined={!!member}
                team="teamA"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameRoomPage;
