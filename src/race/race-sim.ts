import type { GameModeId, PlayerInput, RaceState, RacerState, TrackDef } from '../core/types.js';
import { gameModeById } from '../config/game-modes.js';
import { tickCameraTraps } from '../environment/cameras.js';
import { createGimmickState, tickGimmicks } from '../environment/gimmicks.js';
import { applyHazardHit, applyWindForce, initHazards, tickHazards } from '../environment/hazards.js';
import { gateBlocksRacer, initGateStates, tickGates } from '../environment/gates.js';
import { VEHICLES } from '../config/vehicles.js';
import {
  applyBoostPad,
  createTrackSamples,
  resolveRacerCollision,
  updateVehicle,
} from '../physics/vehicle-controller.js';
import type { TrackSample } from '../physics/track-math.js';
import { aiInput } from './ai-driver.js';
import { rankRacers, updateLapProgress } from './lap-system.js';
import {
  battleLapPickups,
  initPickups,
  initTokens,
  magnetPull,
  tickDroneZap,
  tickFoam,
  tickMines,
  tickPickups,
  tickPowerUpTimers,
  tryCollectPickup,
  tryCollectToken,
  useHeldPowerUp,
} from '../powerups/runtime.js';
import {
  computeCoins,
  computeStylePoints,
  isRaceComplete,
  resolveLapCount,
  tickCheckpointRush,
  tickEliminationCamera,
} from './mode-logic.js';

let samplesCache: TrackSample[] = [];

function hazardIntensityForMode(state: RaceState): number {
  if (state.mode !== 'hazard_run') return 1;
  const lapBoost = state.racers.find((r) => r.isPlayer)?.lap ?? 0;
  return 1 + lapBoost * 0.35 + state.timeMs / 90000;
}

export function createRaceState(
  track: TrackDef,
  playerVehicleId: string,
  mode: GameModeId = 'standard_race',
): RaceState {
  samplesCache = createTrackSamples(track);
  const modeCfg = gameModeById(mode);
  const lapCount = resolveLapCount(mode, track);
  const aiCount = Math.max(0, modeCfg.racerCount - 1);
  const aiVehicles = VEHICLES.filter((v) => v.id !== playerVehicleId).slice(0, aiCount);

  const racers: RacerState[] = [
    makeRacer('p0', playerVehicleId, true, track, 0),
    ...aiVehicles.map((v, i) => makeRacer(`ai${i}`, v.id, false, track, i + 1)),
  ];

  const pickups = initPickups(track.pickups);
  if (mode === 'battle_lap') battleLapPickups(pickups);

  const firstCp = track.checkpoints[0];

  return {
    phase: 'countdown',
    mode,
    trackId: track.id,
    lapCount,
    timeMs: 0,
    countdownMs: 3000,
    racers,
    hazards: initHazards(track.hazards),
    pickups,
    tokens: initTokens(track.tokens),
    mines: [],
    foamPatches: [],
    gateOpen: initGateStates(track),
    message: '',
    messageTimerMs: 0,
    playerVehicleId,
    coinsEarned: 0,
    stylePoints: 0,
    checkpointDeadlineMs: firstCp?.deadlineMs ?? Infinity,
    bestLapMs: Infinity,
    currentLapStartMs: 0,
    offensivePickupsAllowed: modeCfg.offensivePickups,
    hazardIntensity: mode === 'hazard_run' ? 1.2 : 1,
    gimmickState: createGimmickState(),
    empUsesThisRace: 0,
  };
}

function makeRacer(
  id: string,
  vehicleId: string,
  isPlayer: boolean,
  track: TrackDef,
  slot: number,
): RacerState {
  const pos = track.startPositions[slot] ?? track.startPositions[0]!;
  const angle = track.startAngles[slot] ?? -Math.PI / 2;
  return {
    id,
    vehicleId,
    isPlayer,
    x: pos.x,
    y: pos.y,
    angle,
    vx: 0,
    vy: 0,
    speed: 0,
    lap: 0,
    lapProgress: 0,
    totalProgress: 0,
    finished: false,
    finishTimeMs: 0,
    position: slot + 1,
    boostMs: 0,
    boostCooldownMs: 0,
    shieldMs: 0,
    gripMs: 0,
    empSlowMs: 0,
    overchargeMs: 0,
    jamBlockerMs: 0,
    cameraCloakMs: 0,
    autoCorrectMs: 0,
    magnetMs: 0,
    chargeLinkMs: 0,
    gateHackMs: 0,
    paintFoamMs: 0,
    sideDashCooldownMs: 0,
    droneZapTargetId: null,
    droneZapTimerMs: 0,
    heldPowerUp: null,
    offTrackMs: 0,
    stuckMs: 0,
    eliminationStrikes: 0,
    eliminated: false,
    checkpointIndex: 0,
    tokensCollected: 0,
  };
}

export function getTrackSamples(): TrackSample[] {
  return samplesCache;
}

export function tickRace(
  state: RaceState,
  track: TrackDef,
  playerInput: PlayerInput,
  dtMs: number,
): void {
  const dt = dtMs / 1000;
  const samples = samplesCache;

  if (state.messageTimerMs > 0) state.messageTimerMs -= dtMs;

  if (state.phase === 'countdown') {
    state.countdownMs -= dtMs;
    if (state.countdownMs <= 0) {
      state.phase = 'racing';
      state.currentLapStartMs = 0;
      flash(state, 'START!');
    }
    return;
  }

  if (state.phase !== 'racing') return;

  state.timeMs += dtMs;
  if (state.mode === 'hazard_run') {
    state.hazardIntensity = hazardIntensityForMode(state);
  }

  tickHazards(state.hazards, track.hazards, dt, state.hazardIntensity);
  tickGimmicks(state, track, dtMs);
  tickPickups(state.pickups, dtMs, track.id, state.offensivePickupsAllowed);
  tickMines(state.mines, state.racers, dtMs);
  tickFoam(state.foamPatches, state.racers, dtMs);
  tickDroneZap(state.racers);
  tickGates(state.gateOpen, track, state.racers);
  tickCameraTraps(track, state.racers, state.gateOpen);

  if (track.biome === 'balcony') {
    for (const r of state.racers) {
      if (!r.eliminated) applyWindForce(r, state.timeMs);
    }
  }

  const aiCtx = {
    hazards: state.hazards,
    hazardDefs: track.hazards,
    slipZones: track.slipZones,
    opponents: state.racers,
    offensiveAllowed: state.offensivePickupsAllowed,
  };

  for (const racer of state.racers) {
    tickPowerUpTimers(racer, dtMs);
    if (racer.finished || racer.eliminated) continue;

    const input = racer.isPlayer
      ? playerInput
      : aiInput(racer, samples, 0.55 + Math.random() * 0.25, aiCtx);

    if (racer.isPlayer && playerInput.usePowerUp) {
      const used = useHeldPowerUp(racer, state.racers, state.mines, state.foamPatches);
      if (used === 'emp_pulse') state.empUsesThisRace += 1;
    } else if (!racer.isPlayer && input.usePowerUp) {
      useHeldPowerUp(racer, state.racers, state.mines, state.foamPatches);
    }

    updateVehicle(racer, input, track, samples, dt, state);
    gateBlocksRacer(racer, track, state.gateOpen);
    applyBoostPad(racer, track);

    for (const h of state.hazards) {
      const def = track.hazards.find((d) => d.id === h.id);
      if (def) applyHazardHit(racer, h, def, state.hazardIntensity);
    }

    magnetPull(racer, state.pickups, state.tokens);
    for (const p of state.pickups) tryCollectPickup(racer, p, state.offensivePickupsAllowed);
    tryCollectToken(racer, state.tokens);

    if (state.mode !== 'checkpoint_rush') {
      updateLapProgress(racer, samples, state.lapCount);
      if (racer.finished && racer.finishTimeMs === 0) racer.finishTimeMs = state.timeMs;
    }
  }

  for (let i = 0; i < state.racers.length; i++) {
    for (let j = i + 1; j < state.racers.length; j++) {
      resolveRacerCollision(state.racers[i]!, state.racers[j]!);
    }
  }

  rankRacers(state.racers);

  if (state.mode === 'elimination_camera') {
    const strikes = gameModeById('elimination_camera').eliminationStrikes ?? 3;
    tickEliminationCamera(state, strikes);
  }

  if (state.mode === 'checkpoint_rush') {
    tickCheckpointRush(state, track, samples);
  }

  if (isRaceComplete(state)) {
    state.phase = 'finished';
    const player = playerRacer(state);
    state.stylePoints = computeStylePoints(player, player.position);
    state.coinsEarned = computeCoins(state);
    const won =
      player.position === 1 ||
      (state.mode === 'time_trial' && player.finished) ||
      (state.mode === 'checkpoint_rush' && player.checkpointIndex >= track.checkpoints.length);
    flash(state, won ? 'WYGRANA!' : 'KONIEC WYŚCIGU');
  }
}

function flash(state: RaceState, msg: string): void {
  state.message = msg;
  state.messageTimerMs = 2000;
}

export function playerRacer(state: RaceState): RacerState {
  return state.racers.find((r) => r.isPlayer)!;
}
