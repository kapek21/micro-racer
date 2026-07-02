import type { GateDef, RacerState, TrackDef } from '../core/types.js';

export function initGateStates(track: TrackDef): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const g of track.gates) {
    out[g.id] = g.defaultOpen ?? !g.shortcut;
  }
  return out;
}

export function tickGates(
  gateOpen: Record<string, boolean>,
  track: TrackDef,
  racers: RacerState[],
): void {
  for (const g of track.gates) {
    if (!g.shortcut) continue;
    if (g.trigger && g.trigger !== 'default') continue;
    const hacked = racers.some((r) => r.gateHackMs > 0 && nearGate(r, g));
    if (hacked) gateOpen[g.id] = true;
    else gateOpen[g.id] = false;
  }
}

export function gateBlocksRacer(racer: RacerState, track: TrackDef, gateOpen: Record<string, boolean>): boolean {
  for (const g of track.gates) {
    if (gateOpen[g.id]) continue;
    if (!g.shortcut) continue;
    if (nearGate(racer, g)) {
      racer.vx *= -0.3;
      racer.vy *= -0.3;
      return true;
    }
  }
  return false;
}

function nearGate(r: RacerState, g: GateDef): boolean {
  return r.x >= g.x - 20 && r.x <= g.x + g.w + 20 && r.y >= g.y - 20 && r.y <= g.y + g.h + 20;
}
