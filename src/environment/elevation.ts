import type { RacerState, TrackDef } from '../core/types.js';

export function applyElevation(
  _racer: RacerState,
  _track: TrackDef,
): { grade: number; ramp: boolean } {
  return { grade: 0, ramp: false };
}

export function elevationSpeedMult(_grade: number, _ramp: boolean): number {
  return 1;
}

export function elevationAccelMult(_grade: number): number {
  return 1;
}

export function elevationVisualScale(_grade: number): number {
  return 1;
}
