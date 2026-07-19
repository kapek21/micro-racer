import type { RaceState, RacerState, TrackDef } from '../core/types.js';

/** No-op stubs — stadium gimmicks removed in Smart Rush figure-8 rebuild. */
export function createGimmickState(): Record<string, never> {
  return {};
}

export function tickGimmicks(_state: RaceState, _track: TrackDef, _dtMs: number): void {}

export function isSprinklerSlipActive(_state: RaceState, _slipId: string): boolean {
  return false;
}

export function rhythmSectorGripMult(
  _state: RaceState,
  _track: TrackDef,
  _racer: RacerState,
): number {
  return 1;
}
