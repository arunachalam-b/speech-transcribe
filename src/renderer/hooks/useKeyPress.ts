import { useEffect, useState } from 'react';

const useKeyPress = (keyCode: string) => {
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === keyCode) {
        event.preventDefault(); // Prevent the key's default action
        if (!isHolding) setIsHolding(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === keyCode) {
        setIsHolding(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isHolding, keyCode]);

  return isHolding;
};

export default useKeyPress;
