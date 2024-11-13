import {
  transformEndAnimation,
  opacityEndAnimation,
  transformStartAnimation,
} from '@gol-ya-pooch/frontend/components/Toast/animations';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface IToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const Toast = ({ message, onDismiss, duration }: IToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <motion.div
      exit={{
        transform: transformEndAnimation,
        opacity: opacityEndAnimation,
      }}
      animate={{
        transform: transformStartAnimation,
      }}
      className="bg-white text-gray-600 rounded-full px-8 py-4 animate-jelly mt-3"
    >
      {message}
    </motion.div>
  );
};
