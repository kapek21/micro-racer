import type { TrackDef } from '../core/types.js';
import { BIOME_PROPS } from '../config/biome-decorations.js';
import type { SpriteAtlas } from './sprite-atlas.js';
import { SpritePool } from './sprite-pool.js';

const DECO_SCALE = 0.68;

export function syncBiomeDecorations(
  pool: SpritePool,
  atlas: SpriteAtlas,
  track: TrackDef,
  t: number,
  active: Set<string>,
  camera?: { x: number; y: number },
): void {
  const props = BIOME_PROPS[track.biome] ?? [];
  const camX = camera?.x ?? 600;
  const camY = camera?.y ?? 400;

  for (let i = 0; i < props.length; i++) {
    const p = props[i]!;
    const tex = atlas.biomes[p.key];
    if (!tex) continue;

    const id = `biome_${track.biome}_${i}`;
    active.add(id);

    const depth = 0.015 + (p.scale ?? 1) * 0.008;
    const px = p.x + (p.x - camX) * depth;
    const py = p.y + (p.y - camY) * depth;

    let alpha = 0.92;
    let scale = p.scale * DECO_SCALE;
    let rotation = p.rotation ?? 0;
    let y = py;

    switch (p.anim) {
      case 'pulse':
        scale *= 1 + 0.04 * Math.sin(t * 0.005);
        alpha = 0.9 + 0.08 * Math.sin(t * 0.005);
        break;
      case 'bob':
        y += Math.sin(t * 0.006 + p.x) * 4;
        break;
      case 'flicker':
        alpha = 0.65 + 0.35 * Math.abs(Math.sin(t * 0.018));
        break;
      case 'rotate':
        rotation += Math.sin(t * 0.003 + p.y) * 0.18;
        break;
    }

    const sid = `biome_shadow_${track.biome}_${i}`;
    active.add(sid);
    pool.set(sid, atlas.shadow, px, y + 14 * scale, rotation, scale * 1.1, { alpha: alpha * 0.65 });

    pool.set(id, tex, px, y, rotation, scale, {
      alpha,
      glow: undefined,
    });
  }
}
