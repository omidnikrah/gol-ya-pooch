import clsx from 'clsx';
import { ReactNode } from 'react';

interface IPlayerBadgesProps {
  position: 'top' | 'bottom';
  children: ReactNode;
}

interface IPlayerBadgeProps {
  type: 'success' | 'info';
  children: ReactNode;
}

const PlayerBadgesWrapper = ({ children, position }: IPlayerBadgesProps) => (
  <div
    className={clsx(
      'absolute translate-x-1/2 right-1/2 flex flex-col gap-3 items-center w-full',
      {
        'translate-y-10 top-full': position === 'bottom',
        '-translate-y-10 bottom-full': position === 'top',
      },
    )}
  >
    {children}
  </div>
);

const PlayerBadge = ({ children, type }: IPlayerBadgeProps) => (
  <span
    className={clsx('px-4 py-1 rounded-full', {
      'bg-green-300 text-green-800': type === 'success',
      'bg-purple-80 text-white': type === 'info',
    })}
  >
    {children}
  </span>
);

export const PlayerBadges = {
  Wrapper: PlayerBadgesWrapper,
  Badge: PlayerBadge,
};
