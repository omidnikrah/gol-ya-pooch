import { useMessagesStore } from '@gol-ya-pooch/frontend/stores';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { usePlayerContext } from './PlayerContext';

export const PlayerMessages = () => {
  const { data, position } = usePlayerContext();
  const { messages } = useMessagesStore();
  const playerMessage = messages?.find(
    (message) => message.playerId === data?.id,
  );

  return (
    <AnimatePresence>
      {playerMessage && (
        <motion.div
          initial={{
            translateY: position === 'bottom' ? 70 : -70,
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            translateY: position === 'bottom' ? 80 : -80,
            scale: 1,
            opacity: 1,
          }}
          exit={{
            translateY: position === 'bottom' ? 70 : -70,
            scale: 0.8,
            opacity: 0,
          }}
          className={clsx(
            'absolute px-4 py-2 rounded-full bg-white flex items-center justify-center after:absolute after:size-3 after:rounded-sm after:bg-white after:rotate-45',
            {
              'after:-top-1.5': position === 'bottom',
              'after:-bottom-1.5': position === 'top',
            },
          )}
        >
          {playerMessage.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
