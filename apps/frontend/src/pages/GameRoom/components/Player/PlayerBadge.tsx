import clsx from 'clsx';
import { ReactNode } from 'react';

interface IBadgeProps {
  position: 'top' | 'bottom';
  type: 'ready' | 'me';
  children: ReactNode;
}

export const PlayerBadge = ({ position, children, type }: IBadgeProps) => (
  <span
    className={clsx(
      'absolute translate-x-1/2 right-1/2 px-4 py-1 rounded-full',
      {
        'bg-green-300 text-green-800': type === 'ready',
        'bg-purple-80 text-white translate-y-24': type === 'me',
        'translate-y-14': position === 'bottom',
        '-translate-y-14': position === 'top',
      },
    )}
  >
    {children}
  </span>
);
