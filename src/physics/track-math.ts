import type { TrackDef, Vec2 } from '../core/types.js';

export interface TrackSample {
  progress: number;
  x: number;
  y: number;
  angle: number;
  dist: number;
}

function segLen(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function circularDist(a: number, b: number): number {
  let d = Math.abs(a - b);
  if (d > 0.5) d = 1 - d;
  return d;
}

export function buildTrackSamples(track: TrackDef): TrackSample[] {
  const pts = track.centerline;
  const samples: TrackSample[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    total += segLen(pts[i]!, pts[i + 1]!);
  }

  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const len = segLen(a, b);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const steps = Math.max(4, Math.ceil(len / 20));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      samples.push({
        progress: (acc + len * t) / total,
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle,
        dist: acc + len * t,
      });
    }
    acc += len;
  }
  return samples;
}

export function nearestTrackSample(
  samples: TrackSample[],
  x: number,
  y: number,
): TrackSample {
  let best = samples[0]!;
  let bestD = Infinity;
  for (const s of samples) {
    const d = (s.x - x) ** 2 + (s.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

/**
 * Prefer samples near previous progress — critical at figure-8 crossing
 * where two centerline segments occupy the same space.
 */
export function nearestTrackSampleContinuous(
  samples: TrackSample[],
  x: number,
  y: number,
  prevProgress: number,
  window = 0.2,
): TrackSample {
  let best = samples[0]!;
  let bestScore = Infinity;
  for (const s of samples) {
    const dProg = circularDist(s.progress, prevProgress);
    const dist2 = (s.x - x) ** 2 + (s.y - y) ** 2;
    const progPenalty = dProg > window ? (dProg - window) * (dProg - window) * 120_000 : dProg * dProg * 8_000;
    const score = dist2 + progPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

export function isOnTrack(track: TrackDef, samples: TrackSample[], x: number, y: number): boolean {
  const s = nearestTrackSample(samples, x, y);
  const d = Math.hypot(s.x - x, s.y - y);
  return d <= track.trackWidth * 0.52;
}

export function clampToTrack(track: TrackDef, samples: TrackSample[], x: number, y: number): Vec2 {
  const s = nearestTrackSample(samples, x, y);
  const dx = x - s.x;
  const dy = y - s.y;
  const d = Math.hypot(dx, dy) || 1;
  const maxD = track.trackWidth * 0.48;
  if (d <= maxD) return { x, y };
  const nx = dx / d;
  const ny = dy / d;
  return { x: s.x + nx * maxD, y: s.y + ny * maxD };
}

export function lookaheadSample(samples: TrackSample[], progress: number, offset: number): TrackSample {
  const n = samples.length;
  const idx = Math.floor(((progress + offset + 1) % 1) * n) % n;
  return samples[idx]!;
}
