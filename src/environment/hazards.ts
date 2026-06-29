import type { HazardDef, HazardState, RacerState } from '../core/types.js';

export function initHazards(defs: HazardDef[]): HazardState[] {
  return defs.map((d) => ({
    id: d.id,
    kind: d.kind,
    x: d.x1,
    y: d.y1,
    angle: Math.atan2(d.y2 - d.y1, d.x2 - d.x1),
    t: 0,
  }));
}

export function tickHazards(hazards: HazardState[], defs: HazardDef[], dt: number): void {
  for (const h of hazards) {
    const def = defs.find((d) => d.id === h.id);
    if (!def) continue;
    const speed = def.speed ?? 120;
    const dx = def.x2 - def.x1;
    const dy = def.y2 - def.y1;
    const len = Math.hypot(dx, dy) || 1;
    h.t += dt * speed;
    const phase = (Math.sin(h.t / len) + 1) * 0.5;
    h.x = def.x1 + dx * phase;
    h.y = def.y1 + dy * phase;
  }
}

export function applyHazardHit(racer: RacerState, h: HazardState, def: HazardDef): boolean {
  const r = def.width ?? 32;
  const dx = racer.x - h.x;
  const dy = racer.y - h.y;
  if (Math.hypot(dx, dy) > r + 14) return false;
  if (racer.shieldMs > 0) return true;

  const dist = Math.hypot(dx, dy) || 1;
  const push = def.kind === 'drone_drop' ? 200 : 160;

  if (def.kind === 'conveyor') {
    const fx = Math.cos(h.angle);
    const fy = Math.sin(h.angle);
    racer.vx += fx * 80;
    racer.vy += fy * 80;
    return true;
  }

  racer.vx = (dx / dist) * push;
  racer.vy = (dy / dist) * push;
  if (def.kind === 'robot_vacuum' || def.kind === 'robot_mower') {
    racer.empSlowMs = Math.max(racer.empSlowMs, 800);
  }
  if (def.kind === 'drone_drop') {
    racer.empSlowMs = Math.max(racer.empSlowMs, 1000);
  }
  return true;
}

/** @deprecated use applyHazardHit */
export const applyVacuumHit = applyHazardHit;

export function applyWindForce(racer: RacerState, timeMs: number): void {
  const wind = Math.sin(timeMs * 0.001) * 40;
  racer.vx += wind * 0.02;
  racer.vy += Math.cos(timeMs * 0.0013) * 20 * 0.02;
}
