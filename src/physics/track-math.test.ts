import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SMART_KITCHEN } from '../config/tracks/index.js';
import { buildTrackSamples, isOnTrack } from './track-math.js';

test('smart kitchen centerline keeps start on track', () => {
  const samples = buildTrackSamples(SMART_KITCHEN);
  const start = SMART_KITCHEN.startPositions[0]!;
  assert.ok(isOnTrack(SMART_KITCHEN, samples, start.x, start.y));
  assert.ok(samples.length > 20);
});
