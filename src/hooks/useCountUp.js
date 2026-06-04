import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms using an easeOutExpo curve.
 * Returns the current animated value as a number.
 *
 * @param {number|string} target  - The final value to animate to (non-numbers return as-is)
 * @param {number}        duration - Animation duration in milliseconds (default 1200)
 */
export default function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const rafRef  = useRef(null);
  const startTs = useRef(null);

  useEffect(() => {
    const num = parseFloat(target);
    if (isNaN(num)) { setDisplay(target); return; }   // not a number — show as-is

    // Reset and start animation
    startTs.current = null;
    setDisplay(0);

    const animate = (ts) => {
      if (!startTs.current) startTs.current = ts;
      const elapsed  = ts - startTs.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplay(Math.round(eased * num));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}
