import { useEffect } from 'react';

const SPACE_KEY = 'Space';

export const useKeyPress = (
  keyName: string | string[],
  callback: () => void,
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keys = Array.isArray(keyName) ? keyName : [keyName];
      const normalizedKeys = !keys.includes(SPACE_KEY)
        ? keys
        : keys.map((key) => (key === SPACE_KEY ? ' ' : key));

      if (normalizedKeys.includes(event.key)) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, keyName]);
};
