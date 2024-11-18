import { useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { Events, GameInfo, TeamNames } from '@gol-ya-pooch/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';

import GameTableIcon from './assets/game-table.svg';
import { ReadyButton, Team } from './components';

const GameRoomPage = () => {
  const params = useParams();
  const { on, emit, off, error } = useSocket();
  const [gameRoomData, setGameRoomData] = useState<GameInfo>();
  const { gameState } = useGameStore();
  const { player } = usePlayerStore();
  const gameSize = gameRoomData ? gameRoomData.gameSize / 2 : 0;

  console.log(gameState);

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

  if (error && error.type === 'game_not_found') {
    return (
      <div className="text-center text-white text-2xl">
        همچین بازی‌ای وجود نداره یا شایدم تموم شده! 🤷🏻‍♂️
      </div>
    );
  }

  const playerTeamName = player?.team ?? 'teamA';

  return (
    <>
      <div className="flex justify-center">
        <div className="flex justify-center relative max-w-[1000px]">
          {Object.entries(gameRoomData?.teams || {}).map(([name, team]) => {
            return (
              <Team
                key={name}
                teamName={name as TeamNames}
                gameSize={gameSize}
                members={team.members || []}
                playerTeamName={playerTeamName}
              />
            );
          })}
          <GameTableIcon className="w-full h-auto" />
        </div>
      </div>
      <ReadyButton />
    </>
  );
};

export default GameRoomPage;
