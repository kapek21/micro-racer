import type { CameraTrapDef, RacerState, TrackDef } from '../core/types.js';

export function tickCameraTraps(
  track: TrackDef,
  racers: RacerState[],
  gateOpen: Record<string, boolean>,
): void {
  for (const cam of track.cameraTraps) {
    const detected = racers.some((r) => r.cameraCloakMs <= 0 && inRadius(r, cam));
    if (!detected) continue;
    for (const g of track.gates) {
      if (g.shortcut) gateOpen[g.id] = false;
    }
  }
}

function inRadius(r: RacerState, cam: CameraTrapDef): boolean {
  return Math.hypot(r.x - cam.x, r.y - cam.y) <= cam.radius;
}
