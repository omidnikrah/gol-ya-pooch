import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useGameControls, useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { TeamNames } from '@gol-ya-pooch/shared';

import GameTableIcon from './assets/game-table.svg';
import {
  CoinFlipScene,
  JoinGameRoomModal,
  ReadyButton,
  RoomInformation,
  Team,
} from './components';

const GameRoomPage = () => {
  const { error } = useSocket();
  const { phase, gameState } = useGameStore();
  const { player } = usePlayerStore();
  const gameSize = gameState ? gameState.gameSize / 2 : 0;
  useGameControls();

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
          {Object.entries(gameState?.teams || {}).map(([name, team]) => {
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
      <RoomInformation />
      {phase === GamePhases.WAITING_FOR_PLAYERS && <JoinGameRoomModal />}
      {phase === GamePhases.WAITING_FOR_READY && <ReadyButton />}
      {phase === GamePhases.FLIPPING_COIN && <CoinFlipScene />}
    </>
  );
};

export default GameRoomPage;
