import { useEffect, useRef } from 'react';

/** Mobile touch overlay — auto throttle + steering + action buttons. */
export function TouchControls(): JSX.Element | null {
  const steerRef = useRef(0);
  const throttleRef = useRef(1);
  const boostRef = useRef(false);
  const powerRef = useRef(false);

  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const cx = window.innerWidth * 0.5;
      steerRef.current = Math.max(-1, Math.min(1, (t.clientX - cx) / (window.innerWidth * 0.35)));
    };
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => window.removeEventListener('touchmove', onMove);
  }, []);

  useEffect(() => {
    (window as unknown as { __touchInput?: TouchInputBridge }).__touchInput = {
      poll: () => ({
        steer: steerRef.current,
        throttle: throttleRef.current,
        boost: boostRef.current,
        usePowerUp: powerRef.current,
      }),
      clearPower: () => {
        powerRef.current = false;
        boostRef.current = false;
      },
    };
    return () => {
      delete (window as unknown as { __touchInput?: TouchInputBridge }).__touchInput;
    };
  }, []);

  const hasTouch = typeof window !== 'undefined' && 'ontouchstart' in window;
  if (!hasTouch) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-16 z-10 flex justify-between px-4 md:hidden">
      <button
        type="button"
        className="touch-btn"
        onTouchStart={() => {
          powerRef.current = true;
        }}
      >
        PWR
      </button>
      <button
        type="button"
        className="touch-btn touch-btn-boost"
        onTouchStart={() => {
          boostRef.current = true;
        }}
      >
        BOOST
      </button>
    </div>
  );
}

interface TouchInputBridge {
  poll(): { steer: number; throttle: number; boost: boolean; usePowerUp: boolean };
  clearPower(): void;
}

export function readTouchInput(): TouchInputBridge | null {
  return (window as unknown as { __touchInput?: TouchInputBridge }).__touchInput ?? null;
}
