import type { GameModeId, PlayerInput, RaceState, RacerState, TrackDef } from '../core/types.js';
import { gameModeById } from '../config/game-modes.js';
import { ensureAiVehicles } from '../config/parts.js';
import { tickCameraTraps } from '../environment/cameras.js';
import { applyHazardHit, applyWindForce, initHazards, tickHazards } from '../environment/hazards.js';
import { gateBlocksRacer, initGateStates, tickGates } from '../environment/gates.js';
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
  computeRaceScore,
  computeStylePoints,
  computeTimePoints,
  isRaceComplete,
  resolveLapCount,
} from './mode-logic.js';

let samplesCache: TrackSample[] = [];

export function createRaceState(
  track: TrackDef,
  playerVehicleId: string,
  mode: GameModeId = 'standard_race',
  buildPoints = 0,
): RaceState {
  samplesCache = createTrackSamples(track);
  const modeCfg = gameModeById(mode);
  const lapCount = resolveLapCount(mode, track);
  const aiVehicles = ensureAiVehicles().slice(0, Math.max(0, modeCfg.racerCount - 1));

  const racers: RacerState[] = [
    makeRacer('p0', playerVehicleId, true, track, 0),
    ...aiVehicles.map((v, i) => makeRacer(`ai${i}`, v.id, false, track, i + 1)),
  ];

  const pickups = initPickups(track.pickups);

  return {
    phase: 'countdown',
    mode: 'standard_race',
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
    buildPoints,
    timePoints: 0,
    raceScore: 0,
    checkpointDeadlineMs: Infinity,
    bestLapMs: Infinity,
    currentLapStartMs: 0,
    offensivePickupsAllowed: modeCfg.offensivePickups,
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
  tickHazards(state.hazards, track.hazards, dt);
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

  for (const racer of state.racers) {
    tickPowerUpTimers(racer, dtMs);
    if (racer.finished || racer.eliminated) continue;

    const input = racer.isPlayer
      ? playerInput
      : aiInput(racer, samples, 0.55 + Math.random() * 0.25);

    if (racer.isPlayer && playerInput.usePowerUp) {
      useHeldPowerUp(racer, state.racers, state.mines, state.foamPatches);
    }

    updateVehicle(racer, input, track, samples, dt);
    gateBlocksRacer(racer, track, state.gateOpen);
    applyBoostPad(racer, track);

    for (const h of state.hazards) {
      const def = track.hazards.find((d) => d.id === h.id);
      if (def) applyHazardHit(racer, h, def);
    }

    magnetPull(racer, state.pickups, state.tokens);
    for (const p of state.pickups) tryCollectPickup(racer, p, state.offensivePickupsAllowed);
    tryCollectToken(racer, state.tokens);

    updateLapProgress(racer, samples, state.lapCount);
    if (racer.finished && racer.finishTimeMs === 0) racer.finishTimeMs = state.timeMs;
  }

  for (let i = 0; i < state.racers.length; i++) {
    for (let j = i + 1; j < state.racers.length; j++) {
      resolveRacerCollision(state.racers[i]!, state.racers[j]!);
    }
  }

  rankRacers(state.racers);

  if (isRaceComplete(state)) {
    state.phase = 'finished';
    const player = playerRacer(state);
    state.stylePoints = computeStylePoints(player, player.position);
    state.timePoints = computeTimePoints(player.finishTimeMs, track.parTimeMs, player.position);
    state.raceScore = computeRaceScore(state.buildPoints, state.timePoints);
    state.coinsEarned = computeCoins(state);
    flash(state, player.position === 1 ? 'WYGRANA!' : 'KONIEC WYŚCIGU');
  }
}

function flash(state: RaceState, msg: string): void {
  state.message = msg;
  state.messageTimerMs = 2000;
}

export function playerRacer(state: RaceState): RacerState {
  return state.racers.find((r) => r.isPlayer)!;
}
