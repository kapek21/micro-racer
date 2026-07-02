import type { HazardState, PlayerInput, RacerState, TrackDef } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { lookaheadSample } from '../physics/track-math.js';
import { isOffensivePowerUp } from '../config/powerups.js';

export interface AiContext {
  hazards: HazardState[];
  hazardDefs: TrackDef['hazards'];
  slipZones: TrackDef['slipZones'];
  opponents: RacerState[];
  offensiveAllowed: boolean;
}

export function aiInput(
  racer: RacerState,
  samples: TrackSample[],
  skill: number,
  ctx?: AiContext,
): PlayerInput {
  const look = lookaheadSample(samples, racer.lapProgress, 0.07 + skill * 0.05);
  let targetAngle = Math.atan2(look.y - racer.y, look.x - racer.x);

  if (ctx) {
    const avoid = computeHazardAvoidance(racer, ctx);
    targetAngle += avoid.steerOffset;
  }

  let diff = targetAngle - racer.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  let steer = Math.max(-1, Math.min(1, diff * (2.4 + skill * 0.5)));
  if (ctx) steer += computeHazardAvoidance(racer, ctx).steerOffset * 0.5;

  const boost = racer.boostCooldownMs <= 0 && racer.speed > 180 && Math.abs(diff) < 0.35 && Math.random() < 0.025;
  let brake = Math.abs(diff) > 1.1 && racer.speed > 220;

  if (ctx) {
    const threat = nearestHazardThreat(racer, ctx);
    if (threat < 70 && racer.speed > 140) brake = true;
  }

  const usePowerUp = ctx ? shouldAiUsePowerUp(racer, ctx) : false;

  return {
    steer: Math.max(-1, Math.min(1, steer)),
    throttle: brake ? 0.55 : 1,
    brake,
    handbrake: false,
    boost,
    usePowerUp,
  };
}

function nearestHazardThreat(racer: RacerState, ctx: AiContext): number {
  let best = Infinity;
  for (const h of ctx.hazards) {
    const d = Math.hypot(h.x - racer.x, h.y - racer.y);
    if (d < best) best = d;
  }
  return best;
}

function computeHazardAvoidance(racer: RacerState, ctx: AiContext): { steerOffset: number } {
  let steerOffset = 0;
  for (const h of ctx.hazards) {
    const dx = h.x - racer.x;
    const dy = h.y - racer.y;
    const d = Math.hypot(dx, dy);
    if (d > 120 || d < 1) continue;
    const def = ctx.hazardDefs.find((x) => x.id === h.id);
    const radius = (def?.width ?? 32) + 40;
    if (d > radius) continue;
    const push = (1 - d / radius) * 0.9;
    steerOffset -= Math.sign(dx) * push;
  }
  for (const z of ctx.slipZones) {
    if (racer.x >= z.x && racer.x <= z.x + z.w && racer.y >= z.y && racer.y <= z.y + z.h) {
      steerOffset *= 1.2;
    }
  }
  return { steerOffset: Math.max(-0.6, Math.min(0.6, steerOffset)) };
}

function shouldAiUsePowerUp(racer: RacerState, ctx: AiContext): boolean {
  const held = racer.heldPowerUp;
  if (!held) return false;

  if (held.id === 'side_dash' && racer.sideDashCooldownMs > 0) return false;

  const offensive = isOffensivePowerUp(held.id);
  if (offensive && !ctx.offensiveAllowed) return false;

  if (offensive) {
    for (const o of ctx.opponents) {
      if (o.eliminated || o.id === racer.id) continue;
      const d = Math.hypot(o.x - racer.x, o.y - racer.y);
      if (d < 130 && Math.random() < 0.04) return true;
    }
    if (nearestHazardThreat(racer, ctx) < 50 && held.id === 'nano_mine' && Math.random() < 0.03) return true;
    return false;
  }

  if (held.id === 'shield_bubble' && nearestHazardThreat(racer, ctx) < 80 && Math.random() < 0.05) return true;
  if (held.id === 'smart_grip' && racer.speed > 200 && Math.random() < 0.03) return true;
  if (held.id === 'turbo_cell' && racer.speed > 160 && Math.random() < 0.025) return true;
  if (held.id === 'auto_correct' && Math.random() < 0.02) return true;

  return false;
}
