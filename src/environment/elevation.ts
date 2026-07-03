import type { RacerState, TrackDef } from '../core/types.js';

export interface ElevationSample {
  grade: number;
  ramp: boolean;
}

export function sampleElevation(track: TrackDef, x: number, y: number): ElevationSample {
  for (const z of track.elevationZones ?? []) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
      return { grade: z.grade, ramp: z.ramp ?? false };
    }
  }
  return { grade: 0, ramp: false };
}

export function applyElevation(racer: RacerState, track: TrackDef): ElevationSample {
  const e = sampleElevation(track, racer.x, racer.y);
  racer.elevationGrade = e.grade;
  racer.onRamp = e.ramp;
  return e;
}

export function elevationSpeedMult(grade: number, ramp: boolean): number {
  if (ramp && grade > 0) return 1 + grade * 0.4;
  if (grade > 0) return 1 + grade * 0.2;
  if (grade < 0) return 1 + grade * 0.28;
  return 1;
}

export function elevationAccelMult(grade: number): number {
  if (grade < 0) return 1 + grade * 0.4;
  if (grade > 0) return 1 + grade * 0.15;
  return 1;
}

export function elevationVisualScale(grade: number): number {
  return 1 + grade * 0.08;
}
