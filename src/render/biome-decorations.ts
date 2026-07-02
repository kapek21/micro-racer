import type { TrackDef } from '../core/types.js';
import { BIOME_PROPS } from '../config/biome-decorations.js';
import type { SpriteAtlas } from './sprite-atlas.js';
import { SpritePool } from './sprite-pool.js';

const DECO_SCALE = 0.55;

export function syncBiomeDecorations(
  pool: SpritePool,
  atlas: SpriteAtlas,
  track: TrackDef,
  t: number,
  active: Set<string>,
  camera?: { x: number; y: number },
): void {
  const props = BIOME_PROPS[track.biome] ?? [];
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.002);
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
    let glowAlpha = 0;

    switch (p.anim) {
      case 'pulse':
        scale *= 1 + 0.05 * Math.sin(t * 0.005);
        alpha = 0.88 + 0.12 * Math.sin(t * 0.005);
        glowAlpha = 0.2 + pulse * 0.25;
        break;
      case 'bob':
        y += Math.sin(t * 0.006 + p.x) * 4;
        break;
      case 'flicker':
        alpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.018));
        glowAlpha = alpha * 0.5;
        break;
      case 'rotate':
        rotation += Math.sin(t * 0.003 + p.y) * 0.18;
        break;
    }

    pool.set(id, tex, px, y, rotation, scale, {
      alpha,
      glow:
        glowAlpha > 0
          ? { texture: atlas.glow, alpha: glowAlpha, scale: 1.5 }
          : undefined,
    });
  }
}
