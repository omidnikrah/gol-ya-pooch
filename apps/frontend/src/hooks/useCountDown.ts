import { useState, useEffect } from 'react';

interface UseCountdownOptions {
  from: number;
  onComplete?: () => void;
  enable: boolean;
}

export const useCountdown = ({
  from,
  onComplete,
  enable,
}: UseCountdownOptions) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count <= 0) {
      onComplete?.();
      return;
    }

    if (enable) {
      const timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [count, onComplete, enable]);

  return count;
};
