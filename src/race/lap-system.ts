import type { RacerState } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { nearestTrackSampleContinuous } from '../physics/track-math.js';

/** Finish-line wrap: progress jumped from near end back to near start. */
export function crossedFinishLine(prevProgress: number, nextProgress: number): boolean {
  return prevProgress > 0.82 && nextProgress < 0.18;
}

/**
 * Apply a progress sample and credit a lap when the finish line is crossed.
 * First lap uses `prevProgress > 0.35` (pre-wrap) — never post-wrap totalProgress,
 * which is always &lt; 0.18 after a real crossing and would block lap credit forever.
 */
export function applyLapCrossing(
  racer: RacerState,
  prevProgress: number,
  nextProgress: number,
  lapCount: number,
): boolean {
  if (racer.finished) return false;

  racer.lapProgress = nextProgress;
  racer.totalProgress = racer.lap + nextProgress;

  if (!crossedFinishLine(prevProgress, nextProgress)) return false;

  // Ignore false starts / reverse wrap near spawn on lap 0
  if (racer.lap === 0 && prevProgress <= 0.35) return false;

  racer.lap += 1;
  if (racer.lap >= lapCount) racer.finished = true;
  return true;
}

export function updateLapProgress(racer: RacerState, samples: TrackSample[], lapCount: number): boolean {
  if (racer.finished) return false;
  const prev = racer.lapProgress;
  const s = nearestTrackSampleContinuous(samples, racer.x, racer.y, prev);
  return applyLapCrossing(racer, prev, s.progress, lapCount);
}

export function rankRacers(racers: RacerState[]): void {
  const sorted = [...racers].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTimeMs - b.finishTimeMs;
    if (a.finished) return -1;
    if (b.finished) return 1;
    if (b.lap !== a.lap) return b.lap - a.lap;
    if (b.lapProgress !== a.lapProgress) return b.lapProgress - a.lapProgress;
    return b.totalProgress - a.totalProgress;
  });
  for (let i = 0; i < sorted.length; i++) {
    sorted[i]!.position = i + 1;
  }
}
