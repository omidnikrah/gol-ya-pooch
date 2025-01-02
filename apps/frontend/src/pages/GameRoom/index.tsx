import { KeyboardShortcutsModal } from '@gol-ya-pooch/frontend/components';
import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useGameControls, useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { TeamNames } from '@gol-ya-pooch/shared';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import GameTableIcon from './assets/game-table.svg';
import {
  CoinFlipScene,
  FinishGameResultModal,
  JoinGameRoomModal,
  ReadyButton,
  RoomInformation,
  ShareGameLinkAlert,
  Team,
} from './components';

const GameRoomPage = () => {
  const { error } = useSocket();
  const { phase, gameState } = useGameStore();
  const { player } = usePlayerStore();
  const { t } = useTranslation();
  const gameSize = gameState ? gameState.gameSize / 2 : 0;
  const playerTeamName = player?.team ?? 'teamA';
  useGameControls();

  const isAllPlayersJoined = useMemo(() => {
    if (!gameState) return false;

    const teamAMembers = gameState.teams.teamA.members.length;
    const teamBMembers = gameState.teams.teamB.members.length;

    return teamAMembers + teamBMembers === gameState.gameSize;
  }, [gameState]);

  if (error && error.type === 'game_not_found') {
    return (
      <div className="text-center text-white text-2xl ltr-dir:direction-ltr">
        {t('room.not_found.message')}
      </div>
    );
  }

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
      <KeyboardShortcutsModal />
      {phase === GamePhases.WAITING_FOR_PLAYERS && <JoinGameRoomModal />}
      {phase === GamePhases.WAITING_FOR_READY && <ReadyButton />}
      {phase === GamePhases.WAITING_FOR_READY && !isAllPlayersJoined && (
        <ShareGameLinkAlert />
      )}
      {phase === GamePhases.FLIPPING_COIN && <CoinFlipScene />}
      {phase === GamePhases.GAME_FINISHED && <FinishGameResultModal />}
    </>
  );
};

export default GameRoomPage;
