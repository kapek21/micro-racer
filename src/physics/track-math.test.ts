import assert from 'node:assert/strict';
import { test } from 'node:test';
import { KITCHEN_8 } from '../config/tracks/index.js';
import { buildTrackSamples, isOnTrack, nearestTrackSampleContinuous } from './track-math.js';

test('kitchen figure-8 keeps start on track', () => {
  const samples = buildTrackSamples(KITCHEN_8);
  const start = KITCHEN_8.startPositions[0]!;
  assert.ok(isOnTrack(KITCHEN_8, samples, start.x, start.y));
  assert.ok(samples.length > 40);
  assert.equal(KITCHEN_8.lapCount, 3);
  assert.equal(KITCHEN_8.surface, 'carpet');
});

test('continuous sample prefers previous progress near crossing', () => {
  const samples = buildTrackSamples(KITCHEN_8);
  const mid = samples[Math.floor(samples.length * 0.5)]!;
  const next = nearestTrackSampleContinuous(samples, mid.x, mid.y, mid.progress);
  const delta = Math.abs(next.progress - mid.progress);
  assert.ok(delta < 0.15 || delta > 0.85);
});
