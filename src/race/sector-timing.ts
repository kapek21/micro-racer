/** Legacy stadium sector timing — disabled in Smart Rush figure-8 rebuild. */
import type { RaceState, TrackDef } from '../core/types.js';

export function initSectorTiming(_state: RaceState, _track: TrackDef): void {}

export function tickSectorTiming(_state: RaceState, _track: TrackDef, _dtMs: number): void {}
