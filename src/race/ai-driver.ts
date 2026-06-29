import type { PlayerInput, RacerState } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { lookaheadSample } from '../physics/track-math.js';

export function aiInput(racer: RacerState, samples: TrackSample[], skill: number): PlayerInput {
  const look = lookaheadSample(samples, racer.lapProgress, 0.06 + skill * 0.04);
  let targetAngle = Math.atan2(look.y - racer.y, look.x - racer.x);
  let diff = targetAngle - racer.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const steer = Math.max(-1, Math.min(1, diff * (2.2 + skill)));
  const throttle = racer.speed < 280 + skill * 80 ? 1 : 0.85;
  const boost = racer.boostCooldownMs <= 0 && racer.speed > 200 && Math.abs(diff) < 0.4 && Math.random() < 0.02;

  return { steer, throttle, boost, usePowerUp: false };
}
