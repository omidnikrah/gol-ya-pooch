import { useEffect } from 'react';

export const useKeyPress = (
  keyName: string | string[],
  callback: () => void,
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keys = Array.isArray(keyName) ? keyName : [keyName];
      if (keys.includes(event.key)) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, keyName]);
};
