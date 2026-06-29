import type { PlayerInput, RacerState } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { lookaheadSample } from '../physics/track-math.js';

export function aiInput(racer: RacerState, samples: TrackSample[], skill: number): PlayerInput {
  const look = lookaheadSample(samples, racer.lapProgress, 0.07 + skill * 0.05);
  let targetAngle = Math.atan2(look.y - racer.y, look.x - racer.x);
  let diff = targetAngle - racer.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const steer = Math.max(-1, Math.min(1, diff * (2.4 + skill * 0.5)));
  const boost = racer.boostCooldownMs <= 0 && racer.speed > 180 && Math.abs(diff) < 0.35 && Math.random() < 0.025;
  const brake = Math.abs(diff) > 1.1 && racer.speed > 220;

  return {
    steer,
    throttle: 1,
    brake,
    handbrake: false,
    boost,
    usePowerUp: false,
  };
}
