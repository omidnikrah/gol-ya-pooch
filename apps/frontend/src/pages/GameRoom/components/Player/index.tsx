import { GamePhases } from '@gol-ya-pooch/frontend/enums';
import { useGameStore, usePlayerStore } from '@gol-ya-pooch/frontend/stores';
import { Player as IPlayerData, TeamNames } from '@gol-ya-pooch/shared';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const phasesToShowReadyBadge = [
    GamePhases.WAITING_FOR_PLAYERS,
    GamePhases.WAITING_FOR_READY,
  ];

  const shouldShowReadyBadge =
    data?.isReady && phasesToShowReadyBadge.includes(phase);
  const isMe = player?.id && player?.id === data?.id;

  const hasObject = isMe && player?.objectLocation;
  const objectHandPosition = player?.objectLocation?.hand;

  const shouldShowActionButtons =
    gameState?.currentTurn === team &&
    position !== 'bottom' &&
    phase === GamePhases.PLAYING;

  return (
    <TeamPlayer.Root team={team} position={position} data={data}>
      <TeamPlayer.Messages />

      <TeamPlayer.Badges.Wrapper position={position}>
        {shouldShowReadyBadge && (
          <TeamPlayer.Badges.Badge type="success">
            {t('ready')}
          </TeamPlayer.Badges.Badge>
        )}

        {hasObject && (
          <TeamPlayer.Badges.Badge type="info">
            {t(
              objectHandPosition === 'left'
                ? 'object_location.left_hand'
                : 'object_location.right_hand',
            )}
          </TeamPlayer.Badges.Badge>
        )}

        {isMe && (
          <TeamPlayer.Badges.Badge type="info">
            {t('you')}
          </TeamPlayer.Badges.Badge>
        )}
      </TeamPlayer.Badges.Wrapper>

      {data?.name}

      {isJoined && <TeamPlayer.Hands />}

      {shouldShowActionButtons && <TeamPlayer.ActionButtons />}
    </TeamPlayer.Root>
  );
};
