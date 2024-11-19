import {
  GameSize,
  Player as PlayerType,
  TeamNames,
} from '@gol-ya-pooch/shared';
import clsx from 'clsx';

import { Player } from '..';

interface ITeamProps {
  gameSize: GameSize;
  members: PlayerType[];
  teamName: TeamNames;
  playerTeamName: TeamNames;
}

export const Team = ({
  gameSize,
  members,
  teamName,
  playerTeamName,
}: ITeamProps) => {
  const playerPosition = teamName !== playerTeamName ? 'top' : 'bottom';

  const getWidthClassNames = () => {
    const positionWidth: Record<'top' | 'bottom', Record<number, string>> = {
      top: { 3: 'w-[80%]', 2: 'w-[50%]', 1: 'w-[30%]' },
      bottom: { 3: 'w-[90%]', 2: 'w-[60%]', 1: 'w-[30%]' },
    };

    const colsClass = `grid-cols-${gameSize}`;

    return `${colsClass} ${positionWidth[playerPosition][gameSize]}`;
  };

  return (
    <div
      className={clsx(
        `absolute grid gap-10`,
        {
          'top-0 items-start': playerPosition === 'top',
          'bottom-0 items-end': playerPosition === 'bottom',
        },
        getWidthClassNames(),
      )}
    >
      {Array.from({ length: Number(gameSize) }).map((_, index) => {
        const member = members[index];

        return (
          <Player
            key={member?.id || `player-loading-${index}`}
            data={member}
            isJoined={!!member}
            team={teamName}
            position={playerPosition}
          />
        );
      })}
    </div>
  );
};
