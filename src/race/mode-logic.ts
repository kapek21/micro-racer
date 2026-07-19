import type { GameModeId, RaceState, RacerState, TrackDef } from '../core/types.js';
import { gameModeById } from '../config/game-modes.js';

export function resolveLapCount(mode: GameModeId, track: TrackDef): number {
  const cfg = gameModeById(mode);
  return cfg.lapCount ?? track.lapCount;
}

export function tickEliminationCamera(_state: RaceState, _strikesMax: number): void {
  /* removed from v2 — kept as no-op for import safety */
}

export function tickCheckpointRush(_state: RaceState, _track: TrackDef): void {
  /* removed from v2 */
}

export function computeStylePoints(racer: RacerState, position: number): number {
  let pts = Math.max(0, 50 - position * 10);
  pts += racer.tokensCollected * 5;
  if (racer.offTrackMs < 500) pts += 15;
  return pts;
}

/** Time points 0–700 vs track par; place bonus folded in. */
export function computeTimePoints(
  finishTimeMs: number,
  parTimeMs: number,
  position: number,
): number {
  if (finishTimeMs <= 0) return 0;
  const slowLimit = parTimeMs * 1.35;
  let pts: number;
  if (finishTimeMs <= parTimeMs) {
    const under = (parTimeMs - finishTimeMs) / parTimeMs;
    pts = 550 + Math.min(150, under * 400);
  } else if (finishTimeMs >= slowLimit) {
    pts = 40;
  } else {
    const t = (finishTimeMs - parTimeMs) / (slowLimit - parTimeMs);
    pts = 550 * (1 - t) + 40 * t;
  }
  const placeBonus = Math.max(0, 80 - (position - 1) * 22);
  return Math.round(Math.min(700, Math.max(0, pts + placeBonus)));
}

export function computeRaceScore(buildPoints: number, timePoints: number): number {
  return buildPoints + timePoints;
}

export function computeCoins(state: RaceState): number {
  const player = state.racers.find((r) => r.isPlayer);
  if (!player) return 10;
  let coins = Math.max(10, 80 - player.position * 18);
  coins += player.tokensCollected * 3;
  coins += Math.floor(state.buildPoints / 20);
  coins += Math.floor(state.timePoints / 40);
  return coins;
}

export function isRaceComplete(state: RaceState): boolean {
  return state.racers.every((r) => r.finished || r.eliminated);
}

export function leaderRacer(racers: RacerState[]): RacerState | null {
  const sorted = [...racers]
    .filter((r) => !r.eliminated && !r.finished)
    .sort((a, b) => b.totalProgress - a.totalProgress);
  return sorted[0] ?? null;
}
