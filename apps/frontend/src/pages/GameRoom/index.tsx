import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useGameControls, useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import {
  Events,
  Player,
  PublicGameState,
  TeamNames,
} from '@gol-ya-pooch/shared';
import { useEffect } from 'react';
import { useParams } from 'wouter';

import GameTableIcon from './assets/game-table.svg';
import { CoinFlipScene, ReadyButton, Team } from './components';

const GameRoomPage = () => {
  const params = useParams();
  const { on, emit, off, error } = useSocket();
  const {
    phase,
    gameState,
    setGameState,
    setPlayingPlayerId,
    setRequestedPlayerIdToEmptyPlay,
  } = useGameStore();
  const { player } = usePlayerStore();
  const gameSize = gameState ? gameState.gameSize / 2 : 0;
  useGameControls();

  useEffect(() => {
    emit(Events.GET_ROOM_INFO, {
      gameId: params.gameId,
    });

    on(Events.ROOM_INFO_FETCHED, (data: PublicGameState) => {
      setGameState(data);
    });

    on(Events.REQUEST_EMPTY_PLAY, (playerId: Player['id']) => {
      setRequestedPlayerIdToEmptyPlay(playerId);
    });

    on(Events.PLAYER_PLAYING, (playerId: Player['id']) => {
      setPlayingPlayerId(playerId);
    });

    return () => {
      off(Events.ROOM_INFO_FETCHED);
      off(Events.REQUEST_EMPTY_PLAY);
      off(Events.PLAYER_PLAYING);
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
      {phase === GamePhases.WAITING_FOR_READY && <ReadyButton />}
      {phase === GamePhases.FLIPPING_COIN && <CoinFlipScene />}
    </>
  );
};

export default GameRoomPage;
