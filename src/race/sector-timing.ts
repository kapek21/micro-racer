import type { RaceState, RacerState, TrackDef } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { nearestTrackSample } from '../physics/track-math.js';

export function formatRaceTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '--';
  const s = ms / 1000;
  if (s >= 60) return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
  return s.toFixed(1);
}

export function initRaceTiming(state: RaceState, track: TrackDef): void {
  state.parTimeMs = track.parTimeMs ?? state.lapCount * (track.targetLapMs ?? 22000);
  state.targetLapMs = track.targetLapMs ?? Math.round(state.parTimeMs / Math.max(1, state.lapCount));
  state.raceScore = 0;
  state.lapTimes = [];
  state.sectorSplits = [];
  state.currentLapMs = 0;
  state.deltaParMs = 0;
  state.currentLapStartMs = 0;
  state.lastSectorMs = 0;
  state.nextCheckpointLabel = track.checkpoints[0]?.id.toUpperCase() ?? '';
  state.nextCheckpointDeadlineMs = sectorDeadline(track, 0, 0);

  for (const r of state.racers) {
    r.checkpointIndex = 0;
    r.lastCheckpointCrossMs = -9999;
  }
}

function sectorDeadline(track: TrackDef, cpIndex: number, lapStartMs: number): number {
  const cp = track.checkpoints[cpIndex];
  if (!cp) return Infinity;
  const prev = cpIndex > 0 ? track.checkpoints[cpIndex - 1]!.deadlineMs : 0;
  return lapStartMs + (cp.deadlineMs - prev);
}

export function tickRaceTiming(state: RaceState, track: TrackDef, samples: TrackSample[]): void {
  if (state.phase !== 'racing') return;
  const player = state.racers.find((r) => r.isPlayer);
  if (!player || player.eliminated) return;

  state.currentLapMs = state.timeMs - state.currentLapStartMs;
  const progress = (player.lap + player.lapProgress) / Math.max(0.01, state.lapCount);
  const expectedMs = progress * state.parTimeMs;
  state.deltaParMs = state.timeMs - expectedMs;

  const cps = track.checkpoints;
  if (cps.length === 0) return;

  const idx = player.checkpointIndex % cps.length;
  const cp = cps[idx]!;
  state.nextCheckpointLabel = cp.id.toUpperCase();
  state.nextCheckpointDeadlineMs = sectorDeadline(track, idx, state.currentLapStartMs);

  const s = nearestTrackSample(samples, player.x, player.y);
  const near = s.progress >= cp.progress - 0.045 || Math.hypot(player.x - cp.x, player.y - cp.y) < 95;
  if (!near || state.timeMs - player.lastCheckpointCrossMs < 900) return;

  const sectorMs = state.timeMs - (state.lastSectorMs || state.currentLapStartMs);
  state.sectorSplits.push(sectorMs);
  state.lastSectorMs = state.timeMs;
  player.lastCheckpointCrossMs = state.timeMs;
  player.checkpointIndex += 1;

  const deadline = sectorDeadline(track, idx, state.currentLapStartMs);
  const onTime = state.timeMs <= deadline;
  const sectorScore = onTime ? 350 : 100;
  state.raceScore += sectorScore;

  if (onTime) {
    state.message = `SEKTOR ${idx + 1}  +${sectorScore}  (${formatRaceTime(sectorMs)})`;
  } else {
    state.message = `SEKTOR ${idx + 1}  +${sectorScore}  (+${formatRaceTime(state.timeMs - deadline)})`;
  }
  state.messageTimerMs = 1800;

  const nextIdx = player.checkpointIndex % cps.length;
  const next = cps[nextIdx];
  if (next) {
    state.nextCheckpointLabel = next.id.toUpperCase();
    state.nextCheckpointDeadlineMs = sectorDeadline(track, nextIdx, state.currentLapStartMs);
  }
}

export function onLapComplete(state: RaceState, player: RacerState, track: TrackDef): void {
  const lapMs = state.timeMs - state.currentLapStartMs;
  state.lapTimes.push(lapMs);
  state.currentLapStartMs = state.timeMs;
  state.lastSectorMs = state.timeMs;
  player.checkpointIndex = 0;
  player.lastCheckpointCrossMs = -9999;
  state.sectorSplits = [];

  let bonus = 0;
  if (lapMs < state.bestLapMs) {
    state.bestLapMs = lapMs;
    bonus += 600;
    state.message = `NOWE OKRĄŻENIE! ${formatRaceTime(lapMs)}  +600`;
  } else {
    state.message = `OKRĄŻENIE ${formatRaceTime(lapMs)}`;
  }
  if (lapMs <= state.targetLapMs) bonus += 450;
  state.raceScore += bonus;
  if (bonus > 0 && !state.message.includes('+')) {
    state.message += `  +${bonus}`;
  }
  state.messageTimerMs = 2400;

  const first = track.checkpoints[0];
  if (first) {
    state.nextCheckpointLabel = first.id.toUpperCase();
    state.nextCheckpointDeadlineMs = sectorDeadline(track, 0, state.currentLapStartMs);
  }
}

export function finalizeRaceScore(state: RaceState, player: RacerState): void {
  state.raceScore += Math.max(0, 250 - player.position * 50);
  state.raceScore += player.tokensCollected * 80;
  if (player.finishTimeMs > 0 && player.finishTimeMs <= state.parTimeMs) {
    state.raceScore += 1000;
  }
  state.stylePoints = state.raceScore;
}
