import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { Player as IPlayerData, TeamNames } from '@gol-ya-pooch/shared';

import { TeamPlayer } from './TeamPlayer';

interface IPlayer {
  team: TeamNames;
  data: IPlayerData | null;
  isJoined: boolean;
  position: 'top' | 'bottom';
}

export const Player = ({ team, data, isJoined, position }: IPlayer) => {
  const { gameState, phase } = useGameStore();
  const { player } = usePlayerStore();

  const phasesToShowReadyBadge = [
    GamePhases.WAITING_FOR_PLAYERS,
    GamePhases.WAITING_FOR_READY,
  ];

  const shouldShowReadyBadge =
    data?.isReady && phasesToShowReadyBadge.includes(phase);
  const shouldShowMeBadge = player?.id && player?.id === data?.id;

  const shouldShowActionButtons =
    gameState?.currentTurn === team &&
    position !== 'bottom' &&
    phase === GamePhases.PLAYING;

  return (
    <TeamPlayer.Root team={team} position={position} data={data}>
      <TeamPlayer.Messages />

      {shouldShowReadyBadge && (
        <TeamPlayer.Badge position={position} type="ready">
          آماده
        </TeamPlayer.Badge>
      )}

      {shouldShowMeBadge && (
        <TeamPlayer.Badge position={position} type="me">
          شما
        </TeamPlayer.Badge>
      )}

      {data?.name}

      {isJoined && <TeamPlayer.Hands />}

      {shouldShowActionButtons && <TeamPlayer.ActionButtons />}
    </TeamPlayer.Root>
  );
};
