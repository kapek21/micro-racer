import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { RacerState } from '../core/types.js';
import { applyLapCrossing, crossedFinishLine } from './lap-system.js';

function stubRacer(overrides: Partial<RacerState> = {}): RacerState {
  return {
    id: 'p',
    vehicleId: 'v',
    isPlayer: true,
    x: 0,
    y: 0,
    angle: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lap: 0,
    lapProgress: 0,
    totalProgress: 0,
    finished: false,
    finishTimeMs: 0,
    position: 1,
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
    ...overrides,
  };
}

test('crossedFinishLine detects wrap', () => {
  assert.equal(crossedFinishLine(0.9, 0.05), true);
  assert.equal(crossedFinishLine(0.5, 0.55), false);
  assert.equal(crossedFinishLine(0.9, 0.5), false);
});

test('first full lap credits lap 0 → 1', () => {
  const r = stubRacer({ lap: 0, lapProgress: 0.9 });
  assert.equal(applyLapCrossing(r, 0.9, 0.05, 3), true);
  assert.equal(r.lap, 1);
  assert.equal(r.finished, false);
  assert.ok(r.lapProgress < 0.18);
});

test('false start near spawn does not credit lap 0', () => {
  const r = stubRacer({ lap: 0, lapProgress: 0.2 });
  assert.equal(applyLapCrossing(r, 0.2, 0.05, 3), false);
  assert.equal(r.lap, 0);
});

test('subsequent laps increment and finish at lapCount', () => {
  const r = stubRacer({ lap: 1, lapProgress: 0.91 });
  assert.equal(applyLapCrossing(r, 0.91, 0.04, 3), true);
  assert.equal(r.lap, 2);
  assert.equal(applyLapCrossing(r, 0.93, 0.02, 3), true);
  assert.equal(r.lap, 3);
  assert.equal(r.finished, true);
});

test('regression: post-wrap totalProgress must not gate first lap', () => {
  // Old bug: after wrap, totalProgress = 0 + 0.05 < 0.35 so first lap never counted
  const r = stubRacer({ lap: 0, lapProgress: 0.95, totalProgress: 0.95 });
  assert.equal(applyLapCrossing(r, 0.95, 0.05, 3), true);
  assert.equal(r.lap, 1);
  assert.ok(r.totalProgress < 0.2);
});
