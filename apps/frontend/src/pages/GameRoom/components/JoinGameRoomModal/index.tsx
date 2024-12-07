import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useSocket } from '@gol-ya-pooch/frontend/hooks';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import {
  Events,
  type GameState,
  PrivatePlayerData,
  TeamNames,
} from '@gol-ya-pooch/shared';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';

export const JoinGameRoomModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamNames>();
  const { emit, on, off } = useSocket();
  const { gameState, setGameState, setGamePhase } = useGameStore();
  const { setPlayerData } = usePlayerStore();

  const emptyTeams = useMemo(() => {
    if (!gameState) return [];

    const teams = gameState.teams;
    const teamSizes = gameState.gameSize / 2;
    const emptyTeamsArr = [];

    if (teams.teamA.members.length < teamSizes) {
      emptyTeamsArr.push('teamA');
    }

    if (teams.teamB.members.length < teamSizes) {
      emptyTeamsArr.push('teamB');
    }

    return emptyTeamsArr;
  }, [gameState]);

  useEffect(() => {
    on(Events.GAME_ROOM_JOINED, (roomData: GameState) => {
      setIsLoading(false);
      setGameState(roomData);
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

  const handleJoinGame = () => {
    setIsLoading(true);

    emit(Events.JOIN_GAME_ROOM, {
      gameSize: gameState?.gameSize,
      gameId: gameState?.gameId,
      team: selectedTeam,
    });
  };

  if (!gameState || emptyTeams.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#351351] bg-opacity-60 backdrop-blur-sm">
      <div className="w-[450px] p-8 bg-white rounded-2xl text-center">
        <h3 className="font-black text-xl text-primary">
          کدوم تیم میخوای جوین بشی؟
        </h3>
        <div className="py-10 flex gap-2 justify-center">
          {emptyTeams.includes('teamA') && (
            <button
              type="button"
              className={clsx(
                'size-20 rounded-full bg-secondary-50 p-2 transition-all hover:scale-110 hover:bg-secondary',
                {
                  'scale-110 !bg-secondary': selectedTeam === 'teamA',
                },
              )}
              onClick={() => setSelectedTeam('teamA')}
            >
              <img src="/images/team-a-hands.png" alt="Blue Team Hands" />
            </button>
          )}
          {emptyTeams.includes('teamB') && (
            <button
              type="button"
              className={clsx(
                'size-20 rounded-full bg-secondary-50 p-2 transition-all hover:scale-110 hover:bg-secondary',
                {
                  'scale-110 !bg-secondary': selectedTeam === 'teamB',
                },
              )}
              onClick={() => setSelectedTeam('teamB')}
            >
              <img src="/images/team-b-hands.png" alt="Blue Team Hands" />
            </button>
          )}
        </div>
        <div>
          <button
            className="px-8 py-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-progress disabled:scale-90 transition-all"
            type="button"
            onClick={handleJoinGame}
            disabled={isLoading || !selectedTeam}
          >
            {!selectedTeam && 'تیم رو انتخاب کن'}

            {selectedTeam &&
              `جوین به ${selectedTeam === 'teamA' ? 'تیم آبی' : 'تیم قرمز'}`}
          </button>
        </div>
      </div>
    </div>
  );
};
