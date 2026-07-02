import type { GimmickRuntimeState, RaceState, RacerState, TrackDef } from '../core/types.js';

export type { GimmickRuntimeState };

export function createGimmickState(): GimmickRuntimeState {
  return { phase: 0, timers: {}, flags: {}, activeSlipIds: new Set() };
}

export function tickGimmicks(state: RaceState, track: TrackDef, dtMs: number): void {
  const g = state.gimmickState;
  g.phase += dtMs;

  switch (track.mainGimmick) {
    case 'hot_panels_boost':
      tickHeatPanels(state.racers, track, g);
      break;
    case 'photocell_gates':
      tickPhotocellGates(state, track);
      break;
    case 'traffic_signals':
      tickTrafficSignals(state, track, g);
      break;
    case 'rhythm_lights':
      tickRhythmLights(state, track, g);
      break;
    case 'wind_blinds':
      tickBlinds(state, track, g);
      break;
    case 'mower_sprinkler':
      tickSprinklers(state, track, g);
      break;
    case 'key_trampoline':
      tickTrampolines(state.racers, track);
      break;
    case 'camera_gates':
      tickLaserBarriers(state, track, g);
      break;
    default:
      break;
  }
}

function inRect(r: RacerState, x: number, y: number, w: number, h: number): boolean {
  return r.x >= x && r.x <= x + w && r.y >= y && r.y <= y + h;
}

function tickHeatPanels(racers: RacerState[], track: TrackDef, g: GimmickRuntimeState): void {
  for (const zone of track.heatZones ?? []) {
    for (const r of racers) {
      if (r.eliminated || !inRect(r, zone.x, zone.y, zone.w, zone.h)) continue;
      r.gripMs = 0;
      if (zone.gripMult < 1) {
        r.vx *= 0.985;
        r.vy *= 0.985;
      }
      if (zone.boostOnExit && r.speed > 80) {
        const key = `heat_${zone.x}_${zone.y}_${r.id}`;
        if (!g.flags[key]) {
          g.flags[key] = true;
          const fx = Math.cos(r.angle);
          const fy = Math.sin(r.angle);
          r.vx += fx * 120;
          r.vy += fy * 120;
          r.boostMs = Math.max(r.boostMs, 400);
        }
      }
    }
    for (const r of racers) {
      const key = `heat_${zone.x}_${zone.y}_${r.id}`;
      if (!inRect(r, zone.x, zone.y, zone.w, zone.h)) g.flags[key] = false;
    }
  }
}

function tickPhotocellGates(state: RaceState, track: TrackDef): void {
  for (const cell of track.photocells ?? []) {
    const gate = track.gates.find((g) => g.id === cell.gateId);
    if (!gate) continue;
    const triggered = state.racers.some(
      (r) => !r.eliminated && inRect(r, cell.x, cell.y, cell.w, cell.h),
    );
    if (triggered) state.gateOpen[cell.gateId] = true;
    else if (cell.autoClose !== false) state.gateOpen[cell.gateId] = false;
  }
}

function tickTrafficSignals(state: RaceState, track: TrackDef, g: GimmickRuntimeState): void {
  for (const sig of track.trafficSignals ?? []) {
    const cycle = sig.cycleMs;
    const green = sig.greenMs;
    const t = (g.phase + (sig.phaseOffsetMs ?? 0)) % cycle;
    const isGreen = t < green;
    g.flags[`sig_${sig.id}`] = isGreen;
    for (const gateId of sig.gateIds) {
      state.gateOpen[gateId] = isGreen;
    }
  }
}

function tickRhythmLights(state: RaceState, track: TrackDef, g: GimmickRuntimeState): void {
  for (const sector of track.rhythmSectors ?? []) {
    const cycle = sector.cycleMs;
    const active = (g.phase + (sector.phaseOffsetMs ?? 0)) % cycle < sector.activeMs;
    g.flags[`rhythm_${sector.id}`] = active;
    if (sector.gateId) state.gateOpen[sector.gateId] = active;
  }
}

function tickBlinds(state: RaceState, track: TrackDef, g: GimmickRuntimeState): void {
  const cycle = 4000;
  const open = (g.phase % cycle) < 2200;
  for (const gate of track.gates) {
    if (gate.trigger === 'blinds') state.gateOpen[gate.id] = open;
  }
  g.flags.blinds_open = open;
}

function tickSprinklers(_state: RaceState, track: TrackDef, g: GimmickRuntimeState): void {
  for (const sp of track.sprinklers ?? []) {
    const cycle = sp.cycleMs;
    const active = (g.phase + (sp.phaseOffsetMs ?? 0)) % cycle < sp.activeMs;
    const key = `sprinkler_${sp.id}`;
    g.flags[key] = active;
    if (active) g.activeSlipIds.add(sp.slipId);
    else g.activeSlipIds.delete(sp.slipId);
  }
}

function tickTrampolines(racers: RacerState[], track: TrackDef): void {
  for (const tr of track.trampolines ?? []) {
    for (const r of racers) {
      if (r.eliminated || !inRect(r, tr.x, tr.y, tr.w, tr.h)) continue;
      r.vx += Math.cos(tr.angle) * tr.impulse;
      r.vy += Math.sin(tr.angle) * tr.impulse;
      r.boostMs = Math.max(r.boostMs, 300);
    }
  }
}

function tickLaserBarriers(state: RaceState, track: TrackDef, g: GimmickRuntimeState): void {
  if (!track.hazardSets.includes('laser')) return;
  const pulse = (g.phase % 3000) < 1500;
  g.flags.laser_active = pulse;
  for (const gate of track.gates) {
    if (gate.trigger === 'laser') state.gateOpen[gate.id] = !pulse;
  }
}

/** Sprinkler slip zones only apply when active. */
export function isSprinklerSlipActive(state: RaceState, slipId: string): boolean {
  return state.gimmickState.activeSlipIds.has(slipId);
}

/** Rhythm sector grip penalty when lights are off. */
export function rhythmSectorGripMult(state: RaceState, track: TrackDef, racer: RacerState): number {
  for (const sector of track.rhythmSectors ?? []) {
    if (!inRect(racer, sector.x, sector.y, sector.w, sector.h)) continue;
    const active = state.gimmickState.flags[`rhythm_${sector.id}`];
    if (!active) return 0.65;
  }
  return 1;
}
