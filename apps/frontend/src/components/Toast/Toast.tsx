import { motion } from 'framer-motion';

import {
  transformEndAnimation,
  opacityEndAnimation,
  transformStartAnimation,
} from './animations';

interface IToastProps {
  message: string;
}

export const Toast = ({ message }: IToastProps) => {
  return (
    <motion.div
      exit={{
        transform: transformEndAnimation,
        opacity: opacityEndAnimation,
      }}
      animate={{
        transform: transformStartAnimation,
      }}
      className="bg-white text-gray-600 rounded-full px-8 py-4 animate-jelly mt-3 text-center"
    >
      {message}
    </motion.div>
  );
};
