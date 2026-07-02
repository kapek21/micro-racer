import type { PlayerInput, RaceState, RacerState, TrackDef } from '../core/types.js';
import { vehicleById } from '../config/vehicles.js';
import { buildTrackSamples, clampToTrack, isOnTrack, type TrackSample } from './track-math.js';
import { isSprinklerSlipActive, rhythmSectorGripMult } from '../environment/gimmicks.js';

export function updateVehicle(
  racer: RacerState,
  input: PlayerInput,
  track: TrackDef,
  samples: TrackSample[],
  dt: number,
  raceState?: RaceState,
): void {
  const cfg = vehicleById(racer.vehicleId);
  const onTrack = isOnTrack(track, samples, racer.x, racer.y);

  let traction = cfg.traction;
  if (racer.gripMs > 0) traction = Math.min(1.08, traction + 0.14);
  if (racer.overchargeMs > 0) traction *= 0.78;
  if (racer.empSlowMs > 0) traction *= 0.72;
  if (inSlipZone(racer, track, raceState)) traction *= 0.68;
  if (inHeatZone(racer, track)) traction *= 0.72;
  if (raceState) traction *= rhythmSectorGripMult(raceState, track, racer);

  const steer = Math.max(-1, Math.min(1, input.steer));
  const cos = Math.cos(racer.angle);
  const sin = Math.sin(racer.angle);

  let forward = racer.vx * cos + racer.vy * sin;
  let lateral = -racer.vx * sin + racer.vy * cos;

  let maxSpeed = cfg.topSpeed;
  if (racer.boostMs > 0) maxSpeed *= 1 + 0.5 * cfg.boostEfficiency;
  if (racer.overchargeMs > 0) maxSpeed *= 1.22;
  if (!onTrack) maxSpeed *= 0.62;
  if (racer.empSlowMs > 0) maxSpeed *= 0.68;

  const accel = cfg.acceleration * (onTrack ? 1 : 0.48);
  if (input.brake) {
    forward *= Math.exp(-7.5 * dt);
  } else {
    const cruise = Math.max(0.72, input.throttle);
    const target = maxSpeed * cruise;
    forward += (target - forward) * accel * dt * 0.0038;
  }

  const grip = traction * (input.handbrake ? 0.35 : 1) * (onTrack ? 1 : 0.55);
  lateral *= Math.exp(-grip * 11 * dt);

  const speed = Math.hypot(forward, lateral);
  const turnMul = 0.55 + 0.45 / (1 + speed / 260);
  const handbrakeTurn = input.handbrake ? 1.35 : 1;
  racer.angle += steer * cfg.turnRate * turnMul * handbrakeTurn * dt;

  const cos2 = Math.cos(racer.angle);
  const sin2 = Math.sin(racer.angle);
  racer.vx = forward * cos2 - lateral * sin2;
  racer.vy = forward * sin2 + lateral * cos2;

  if (input.boost && racer.boostCooldownMs <= 0 && racer.boostMs <= 0) {
    racer.boostMs = 950;
    racer.boostCooldownMs = 2000;
    const boost = 200 * cfg.boostEfficiency;
    racer.vx += cos2 * boost;
    racer.vy += sin2 * boost;
  }

  racer.x += racer.vx * dt;
  racer.y += racer.vy * dt;

  if (!onTrack) {
    racer.offTrackMs += dt * 1000;
    const clamped = clampToTrack(track, samples, racer.x, racer.y);
    racer.x = clamped.x;
    racer.y = clamped.y;
    racer.vx *= 0.9;
    racer.vy *= 0.9;
  } else {
    racer.offTrackMs = Math.max(0, racer.offTrackMs - dt * 2000);
  }

  racer.speed = Math.hypot(racer.vx, racer.vy);

  if (racer.speed < 30 && onTrack && !input.brake) {
    racer.stuckMs += dt * 1000;
    if (racer.stuckMs > 500) {
      racer.vx += cos2 * 100;
      racer.vy += sin2 * 100;
      racer.stuckMs = 0;
    }
  } else {
    racer.stuckMs = 0;
  }
}

function inSlipZone(racer: RacerState, track: TrackDef, raceState?: RaceState): boolean {
  for (const z of track.slipZones) {
    if (z.id && raceState && !isSprinklerSlipActive(raceState, z.id)) continue;
    if (racer.x >= z.x && racer.x <= z.x + z.w && racer.y >= z.y && racer.y <= z.y + z.h) return true;
  }
  return false;
}

function inHeatZone(racer: RacerState, track: TrackDef): boolean {
  for (const z of track.heatZones ?? []) {
    if (racer.x >= z.x && racer.x <= z.x + z.w && racer.y >= z.y && racer.y <= z.y + z.h) return true;
  }
  return false;
}

export function getLateralSpeed(racer: RacerState): number {
  const cos = Math.cos(racer.angle);
  const sin = Math.sin(racer.angle);
  return Math.abs(-racer.vx * sin + racer.vy * cos);
}

export function applyBoostPad(racer: RacerState, track: TrackDef): boolean {
  for (const pad of track.boostPads) {
    if (racer.x >= pad.x && racer.x <= pad.x + pad.w && racer.y >= pad.y && racer.y <= pad.y + pad.h) {
      const cfg = vehicleById(racer.vehicleId);
      const fx = Math.cos(racer.angle);
      const fy = Math.sin(racer.angle);
      const mult = racer.chargeLinkMs > 0 ? 1.45 : 1;
      racer.vx += fx * 240 * cfg.boostEfficiency * mult;
      racer.vy += fy * 240 * cfg.boostEfficiency * mult;
      racer.boostMs = Math.max(racer.boostMs, 550);
      return true;
    }
  }
  return false;
}

export function resolveRacerCollision(a: RacerState, b: RacerState): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const minD = 30;
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
  const push = 130 * (cfgA.collisionResistance + cfgB.collisionResistance) * 0.5;
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
