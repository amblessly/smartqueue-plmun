import { useEffect, useState, useRef } from 'react';

export function useScrollDirection(threshold = 10) {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastYRef = useRef(0);
  const lastDirectionRef = useRef<'up' | 'down'>('up');
  const tickingRef = useRef(false);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const update = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastYRef.current;

      let next = lastDirectionRef.current;
      if (currentY <= threshold) {
        next = 'up';
      } else if (Math.abs(delta) > threshold) {
        next = delta > 0 ? 'down' : 'up';
      }

      if (next !== lastDirectionRef.current) {
        lastDirectionRef.current = next;
        setDirection(next);
      }
      if (Math.abs(delta) > threshold) {
        lastYRef.current = currentY;
      }

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}