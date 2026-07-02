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
): void {
  const props = BIOME_PROPS[track.biome] ?? [];
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.002);

  for (let i = 0; i < props.length; i++) {
    const p = props[i]!;
    const tex = atlas.biomes[p.key];
    if (!tex) continue;

    const id = `biome_${track.biome}_${i}`;
    active.add(id);

    let alpha = 1;
    let scale = p.scale * DECO_SCALE;
    let rotation = p.rotation ?? 0;
    let y = p.y;
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

    pool.set(id, tex, p.x, y, rotation, scale, {
      alpha,
      glow:
        glowAlpha > 0
          ? { texture: atlas.glow, alpha: glowAlpha, scale: 1.5 }
          : undefined,
    });
  }
}
