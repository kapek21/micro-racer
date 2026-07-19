import { useEffect, useRef, useState } from 'react';

/** Mobile: virtual joystick (left) + action buttons (right). */
export function TouchControls(): JSX.Element | null {
  const steerRef = useRef(0);
  const boostRef = useRef(false);
  const powerRef = useRef(false);
  const brakeRef = useRef(false);
  const handbrakeRef = useRef(false);
  const joyActive = useRef(false);
  const joyOrigin = useRef({ x: 0, y: 0 });
  const [joyPos, setJoyPos] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const coarse =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        (navigator.maxTouchPoints ?? 0) > 0);
    setShow(coarse);

    (window as unknown as { __touchInput?: TouchInputBridge }).__touchInput = {
      poll: () => ({
        steer: steerRef.current,
        throttle: 1,
        brake: brakeRef.current,
        handbrake: handbrakeRef.current,
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

  if (!show) return null;

  const onJoyStart = (e: React.TouchEvent): void => {
    const t = e.touches[0];
    if (!t) return;
    joyActive.current = true;
    joyOrigin.current = { x: t.clientX, y: t.clientY };
    setJoyPos({ x: 0, y: 0 });
  };

  const onJoyMove = (e: React.TouchEvent): void => {
    if (!joyActive.current) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - joyOrigin.current.x;
    const max = 52;
    const clamped = Math.max(-max, Math.min(max, dx));
    steerRef.current = clamped / max;
    setJoyPos({ x: clamped, y: 0 });
  };

  const onJoyEnd = (): void => {
    joyActive.current = false;
    steerRef.current = 0;
    setJoyPos({ x: 0, y: 0 });
  };

  return (
    <>
      <div
        className="touch-joy-zone pointer-events-auto absolute z-20"
        onTouchStart={onJoyStart}
        onTouchMove={onJoyMove}
        onTouchEnd={onJoyEnd}
        onTouchCancel={onJoyEnd}
      >
        <div className="touch-joy-base">
          <div className="touch-joy-knob" style={{ transform: `translate(${joyPos.x}px, ${joyPos.y}px)` }} />
        </div>
      </div>

      <div className="touch-actions pointer-events-auto absolute z-20 flex flex-col gap-2">
        <button
          type="button"
          className="touch-btn touch-btn-brake"
          onTouchStart={() => {
            brakeRef.current = true;
          }}
          onTouchEnd={() => {
            brakeRef.current = false;
          }}
        >
          BRAKE
        </button>
        <div className="flex gap-2">
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
        <button
          type="button"
          className="touch-btn touch-btn-drift"
          onTouchStart={() => {
            handbrakeRef.current = true;
          }}
          onTouchEnd={() => {
            handbrakeRef.current = false;
          }}
        >
          DRIFT
        </button>
      </div>
    </>
  );
}

interface TouchInputBridge {
  poll(): {
    steer: number;
    throttle: number;
    brake: boolean;
    handbrake: boolean;
    boost: boolean;
    usePowerUp: boolean;
  };
  clearPower(): void;
}

export function readTouchInput(): TouchInputBridge | null {
  return (window as unknown as { __touchInput?: TouchInputBridge }).__touchInput ?? null;
}
