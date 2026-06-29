import type { RacerState } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { nearestTrackSample } from '../physics/track-math.js';

export function updateLapProgress(racer: RacerState, samples: TrackSample[], lapCount: number): void {
  if (racer.finished) return;
  const prev = racer.lapProgress;
  const s = nearestTrackSample(samples, racer.x, racer.y);
  racer.lapProgress = s.progress;
  racer.totalProgress = racer.lap + s.progress;

  // Cross finish line (progress wrap near start)
  if (prev > 0.82 && s.progress < 0.18 && racer.lap > 0) {
    racer.lap += 1;
    if (racer.lap >= lapCount) {
      racer.finished = true;
    }
  } else if (prev > 0.82 && s.progress < 0.18 && racer.lap === 0 && racer.totalProgress > 0.35) {
    racer.lap = 1;
  }
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
