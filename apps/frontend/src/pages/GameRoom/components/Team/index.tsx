import { Player as PlayerType, TeamNames } from '@gol-ya-pooch/shared';
import clsx from 'clsx';

import { Player } from '..';

interface ITeamProps {
  gameSize: number;
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

  return (
    <div
      className={clsx('absolute grid grid-cols-3 gap-10', {
        'w-[80%] top-0 items-start': playerPosition === 'top',
        'w-[90%] bottom-0 items-end': playerPosition === 'bottom',
      })}
    >
      {Array.from({ length: Number(gameSize) }).map((_, index) => {
        const member = members[index];

        return (
          <Player
            key={member?.id || `player-loading-${index}`}
            data={member || null}
            isJoined={!!member}
            team={teamName}
            position={playerPosition}
          />
        );
      })}
    </div>
  );
};
