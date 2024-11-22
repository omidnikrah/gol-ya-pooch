import { useState, useEffect } from 'react';

interface UseCountdownOptions {
  from: number;
  onComplete?: () => void;
}

export const useCountdown = ({ from, onComplete }: UseCountdownOptions) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return count;
};
