import type { GameModeId, RaceState, RacerState, TrackDef } from '../core/types.js';
import { gameModeById } from '../config/game-modes.js';
import { nearestTrackSample, type TrackSample } from '../physics/track-math.js';

export function resolveLapCount(mode: GameModeId, track: TrackDef): number {
  const cfg = gameModeById(mode);
  return cfg.lapCount ?? track.lapCount;
}

export function tickEliminationCamera(
  state: RaceState,
  strikesMax: number,
): void {
  const leader = state.racers
    .filter((r) => !r.eliminated && !r.finished)
    .sort((a, b) => b.totalProgress - a.totalProgress)[0];
  if (!leader) return;

  const viewRadius = 320;
  for (const r of state.racers) {
    if (r.eliminated || r.finished || r.id === leader.id) continue;
    const dist = Math.hypot(r.x - leader.x, r.y - leader.y);
    if (dist > viewRadius) {
      r.eliminationStrikes += 1;
      if (r.eliminationStrikes >= strikesMax) {
        r.eliminated = true;
        r.finished = true;
        r.finishTimeMs = state.timeMs;
      }
    } else {
      r.eliminationStrikes = Math.max(0, r.eliminationStrikes - dtDecay(state.timeMs));
    }
  }
}

function dtDecay(_timeMs: number): number {
  return 0;
}

export function tickCheckpointRush(state: RaceState, track: TrackDef, samples: TrackSample[]): void {
  if (track.checkpoints.length === 0) return;
  const player = state.racers.find((r) => r.isPlayer);
  if (!player || player.eliminated) return;

  const idx = player.checkpointIndex;
  const cp = track.checkpoints[idx];
  if (!cp) {
    player.finished = true;
    player.finishTimeMs = state.timeMs;
    return;
  }

  const s = nearestTrackSample(samples, player.x, player.y);
  if (s.progress >= cp.progress - 0.05 || Math.hypot(player.x - cp.x, player.y - cp.y) < 80) {
    player.checkpointIndex += 1;
    state.checkpointDeadlineMs = track.checkpoints[player.checkpointIndex]?.deadlineMs ?? Infinity;
    state.message = `CHECKPOINT ${idx + 1}!`;
    state.messageTimerMs = 1500;
  }

  if (state.timeMs > cp.deadlineMs) {
    player.eliminated = true;
    player.finished = true;
    state.message = 'CZAS MINĄŁ!';
    state.messageTimerMs = 2500;
  }
}

export function computeStylePoints(racer: RacerState, position: number): number {
  let pts = Math.max(0, 50 - position * 10);
  pts += racer.tokensCollected * 5;
  if (racer.offTrackMs < 500) pts += 15;
  return pts;
}

export function computeCoins(state: RaceState): number {
  const player = state.racers.find((r) => r.isPlayer);
  if (!player) return 10;
  let coins = Math.max(10, 120 - player.position * 25);
  coins += player.tokensCollected * 3;
  coins += Math.floor(state.stylePoints / 10);
  if (state.mode === 'time_trial' && player.finished) {
    coins += Math.max(0, 80 - Math.floor(player.finishTimeMs / 1000));
  }
  return coins;
}

export function isRaceComplete(state: RaceState): boolean {
  const active = state.racers.filter((r) => !r.eliminated);
  if (state.mode === 'time_trial') {
    return active.every((r) => r.finished);
  }
  if (state.mode === 'checkpoint_rush') {
    const p = state.racers.find((r) => r.isPlayer);
    return Boolean(p?.finished || p?.eliminated);
  }
  if (state.mode === 'elimination_camera') {
    const alive = state.racers.filter((r) => !r.eliminated && !r.finished);
    return alive.length <= 1 || state.racers.every((r) => r.finished || r.eliminated);
  }
  return state.racers.every((r) => r.finished || r.eliminated);
}

export function leaderRacer(racers: RacerState[]): RacerState | null {
  const sorted = [...racers]
    .filter((r) => !r.eliminated && !r.finished)
    .sort((a, b) => b.totalProgress - a.totalProgress);
  return sorted[0] ?? null;
}
