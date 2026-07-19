import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  composeVehicle,
  computeBuildPoints,
  greenZoneHalfWidth,
  partById,
  PARTS,
} from './parts.js';
import { vehicleById } from './vehicles.js';

test('catalog has 9 parts across 3 slots', () => {
  assert.equal(PARTS.length, 9);
  assert.equal(PARTS.filter((p) => p.slot === 'wheels').length, 3);
  assert.equal(PARTS.filter((p) => p.slot === 'body').length, 3);
  assert.equal(PARTS.filter((p) => p.slot === 'engine').length, 3);
});

test('matching surface has wider green zone', () => {
  const slick = partById('wheels_slick');
  assert.ok(greenZoneHalfWidth(slick, 'asphalt') > greenZoneHalfWidth(slick, 'dirt'));
});

test('composeVehicle registers and scores build points', () => {
  const built = composeVehicle(
    'wheels_slick',
    'body_aero',
    'engine_volt',
    'asphalt',
    { wheels: 0, body: 0, engine: 0 },
    'test_build',
  );
  assert.ok(built.buildPoints > 0 && built.buildPoints <= 300);
  assert.equal(vehicleById('test_build').id, 'test_build');
  const pts = computeBuildPoints(
    partById('wheels_slick'),
    partById('body_aero'),
    partById('engine_volt'),
    'asphalt',
    { wheels: 0, body: 0, engine: 0 },
  );
  assert.equal(pts.buildPoints, built.buildPoints);
});
