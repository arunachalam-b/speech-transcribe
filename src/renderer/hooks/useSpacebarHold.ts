import { useEffect, useState } from 'react';

const useSpacebarHold = () => {
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevents scrolling when holding space
        if (!isHolding) setIsHolding(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsHolding(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isHolding]);

  return isHolding;
};

export default useSpacebarHold;
