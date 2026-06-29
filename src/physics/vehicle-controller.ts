import type { PlayerInput, RacerState, TrackDef } from '../core/types.js';
import { vehicleById } from '../config/vehicles.js';
import { buildTrackSamples, clampToTrack, isOnTrack, type TrackSample } from './track-math.js';

const FRICTION = 2.8;
const OFFTRACK_FRICTION = 5.5;

export function updateVehicle(
  racer: RacerState,
  input: PlayerInput,
  track: TrackDef,
  samples: TrackSample[],
  dt: number,
): void {
  const cfg = vehicleById(racer.vehicleId);
  const onTrack = isOnTrack(track, samples, racer.x, racer.y);

  let traction = cfg.traction;
  if (racer.gripMs > 0) traction = Math.min(1.05, traction + 0.12);
  if (racer.overchargeMs > 0) traction *= 0.82;
  if (racer.empSlowMs > 0) traction *= 0.75;
  if (inSlipZone(racer, track)) traction *= 0.72;

  const throttle = Math.max(0, Math.min(1, input.throttle));
  const steer = Math.max(-1, Math.min(1, input.steer));

  const forwardX = Math.cos(racer.angle);
  const forwardY = Math.sin(racer.angle);

  let targetSpeed = cfg.topSpeed * throttle;
  if (racer.boostMs > 0) targetSpeed *= 1 + 0.45 * cfg.boostEfficiency;
  if (racer.overchargeMs > 0) targetSpeed *= 1.25;
  if (!onTrack) targetSpeed *= 0.55;
  if (racer.empSlowMs > 0) targetSpeed *= 0.7;

  const accel = cfg.acceleration * (onTrack ? 1 : 0.45);
  const forwardSpeed = racer.vx * forwardX + racer.vy * forwardY;
  const speedDiff = targetSpeed - Math.max(0, forwardSpeed);
  racer.vx += forwardX * speedDiff * accel * dt * 0.004;
  racer.vy += forwardY * speedDiff * accel * dt * 0.004;

  const speed = Math.hypot(racer.vx, racer.vy);
  const turnScale = cfg.turnRate * traction * (1 + Math.min(speed, 200) / 600);
  racer.angle += steer * turnScale * dt;

  const friction = onTrack ? FRICTION : OFFTRACK_FRICTION;
  racer.vx *= Math.exp(-friction * dt);
  racer.vy *= Math.exp(-friction * dt);

  if (input.boost && racer.boostCooldownMs <= 0 && racer.boostMs <= 0) {
    racer.boostMs = 900;
    racer.boostCooldownMs = 2200;
    const boost = 180 * cfg.boostEfficiency;
    racer.vx += forwardX * boost;
    racer.vy += forwardY * boost;
  }

  racer.x += racer.vx * dt;
  racer.y += racer.vy * dt;

  if (!onTrack) {
    racer.offTrackMs += dt * 1000;
    const clamped = clampToTrack(track, samples, racer.x, racer.y);
    racer.x = clamped.x;
    racer.y = clamped.y;
    racer.vx *= 0.92;
    racer.vy *= 0.92;
  } else {
    racer.offTrackMs = Math.max(0, racer.offTrackMs - dt * 2000);
  }

  racer.speed = Math.hypot(racer.vx, racer.vy);

  if (racer.speed < 25 && onTrack) {
    racer.stuckMs += dt * 1000;
    if (racer.stuckMs > 600) {
      racer.vx += forwardX * 80;
      racer.vy += forwardY * 80;
      racer.stuckMs = 0;
    }
  } else {
    racer.stuckMs = 0;
  }
}

function inSlipZone(racer: RacerState, track: TrackDef): boolean {
  for (const z of track.slipZones) {
    if (racer.x >= z.x && racer.x <= z.x + z.w && racer.y >= z.y && racer.y <= z.y + z.h) return true;
  }
  return false;
}

export function applyBoostPad(racer: RacerState, track: TrackDef): boolean {
  for (const pad of track.boostPads) {
    if (racer.x >= pad.x && racer.x <= pad.x + pad.w && racer.y >= pad.y && racer.y <= pad.y + pad.h) {
      const cfg = vehicleById(racer.vehicleId);
      const fx = Math.cos(racer.angle);
      const fy = Math.sin(racer.angle);
      const mult = racer.chargeLinkMs > 0 ? 1.45 : 1;
      racer.vx += fx * 220 * cfg.boostEfficiency * mult;
      racer.vy += fy * 220 * cfg.boostEfficiency * mult;
      racer.boostMs = Math.max(racer.boostMs, 500);
      return true;
    }
  }
  return false;
}

export function resolveRacerCollision(a: RacerState, b: RacerState): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const minD = 28;
  if (dist >= minD) return;

  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minD - dist;
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;

  const cfgA = vehicleById(a.vehicleId);
  const cfgB = vehicleById(b.vehicleId);
  const push = 120 * (cfgA.collisionResistance + cfgB.collisionResistance) * 0.5;
  const recoverA = a.autoCorrectMs > 0 ? cfgA.recoverySpeed * 1.5 : cfgA.recoverySpeed;
  const recoverB = b.autoCorrectMs > 0 ? cfgB.recoverySpeed * 1.5 : cfgB.recoverySpeed;
  a.vx -= nx * push * 0.02 * (2 - recoverA * 0.5);
  a.vy -= ny * push * 0.02 * (2 - recoverA * 0.5);
  b.vx += nx * push * 0.02 * (2 - recoverB * 0.5);
  b.vy += ny * push * 0.02 * (2 - recoverB * 0.5);
}

export function createTrackSamples(track: TrackDef): TrackSample[] {
  return buildTrackSamples(track);
}
