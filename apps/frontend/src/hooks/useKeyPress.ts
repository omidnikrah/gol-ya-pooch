import { useEffect, useState } from 'react';

export const useKeyPress = () => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKey(event.key);
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return pressedKey;
};
