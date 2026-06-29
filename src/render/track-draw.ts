import type { Graphics } from 'pixi.js';
import type { TrackDef } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import type { ProceduralAssets } from './sprite-atlas.js';

export function drawBiome(g: Graphics, track: TrackDef, t: number): void {
  g.rect(0, 0, 1200, 800).fill(track.bgColor);

  // Ambient grid
  for (let x = 0; x <= 1200; x += 40) {
    g.moveTo(x, 0);
    g.lineTo(x, 800);
    g.stroke({ color: track.accentColor, width: 1, alpha: 0.04 });
  }
  for (let y = 0; y <= 800; y += 40) {
    g.moveTo(0, y);
    g.lineTo(1200, y);
    g.stroke({ color: track.accentColor, width: 1, alpha: 0.04 });
  }

  g.rect(30, 30, 1140, 740).fill({ color: track.accentColor, alpha: 0.06 });
  g.rect(50, 50, 1100, 700).fill({ color: 0x000000, alpha: 0.12 });

  const pulse = 0.5 + 0.5 * Math.sin(t * 0.002);
  switch (track.biome) {
    case 'kitchen':
      g.roundRect(460, 320, 280, 160, 16).fill({ color: 0x505868, alpha: 0.85 });
      g.roundRect(980, 120, 120, 200, 8).fill({ color: 0x2080c0, alpha: 0.2 + pulse * 0.08 });
      break;
    case 'roof':
      for (let i = 0; i < 6; i++) {
        g.rect(200 + i * 140, 250, 100, 60).fill({ color: 0x304060, alpha: 0.55 });
        g.rect(205 + i * 140, 255, 90, 50).fill({ color: 0x406080, alpha: 0.35 });
      }
      break;
    case 'garden':
      g.circle(600, 400, 220).fill({ color: 0x208040, alpha: 0.18 });
      g.circle(600, 400, 180).fill({ color: 0x30a050, alpha: 0.08 });
      break;
    case 'living':
      g.roundRect(400, 300, 400, 200, 20).fill({ color: 0xff40ff, alpha: 0.12 + pulse * 0.1 });
      break;
    case 'city':
      for (let i = 0; i < 8; i++) {
        const h = 80 + (i % 3) * 30;
        g.rect(150 + i * 120, 520 - h, 40, h).fill({ color: 0x203040, alpha: 0.65 });
        g.rect(155 + i * 120, 525 - h, 8, 8).fill({ color: 0xffd040, alpha: 0.4 + pulse * 0.3 });
      }
      break;
    case 'security':
      g.rect(100, 100, 1000, 600).stroke({ color: 0xff4080, width: 1, alpha: 0.15 });
      break;
    case 'garage':
      g.roundRect(180, 150, 840, 500, 12).stroke({ color: 0xffa030, width: 2, alpha: 0.2 });
      break;
    default:
      break;
  }
}

export function drawTrack(
  g: Graphics,
  track: TrackDef,
  samples: TrackSample[],
  assets: ProceduralAssets,
): void {
  const hw = track.trackWidth * 0.5;
  const kerbW = 14;

  // Outer kerbs
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const stripes = Math.max(1, Math.floor(segLen / 16));
    for (let side of [-1, 1]) {
      for (let s = 0; s < stripes; s++) {
        const t0 = s / stripes;
        const t1 = (s + 1) / stripes;
        const ox = nx * (hw + kerbW * 0.5) * side;
        const oy = ny * (hw + kerbW * 0.5) * side;
        const x1 = a.x + (b.x - a.x) * t0 + ox;
        const y1 = a.y + (b.y - a.y) * t0 + oy;
        const x2 = a.x + (b.x - a.x) * t1 + ox;
        const y2 = a.y + (b.y - a.y) * t1 + oy;
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke({
          color: (Math.floor(i + s + (side > 0 ? 0 : 1)) % 2 === 0) ? 0xff3355 : 0xf0f0f0,
          width: kerbW,
          alpha: 0.9,
        });
      }
    }
  }

  // Asphalt ribbon
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    g.moveTo(a.x + nx * hw, a.y + ny * hw);
    g.lineTo(b.x + nx * hw, b.y + ny * hw);
    g.lineTo(b.x - nx * hw, b.y - ny * hw);
    g.lineTo(a.x - nx * hw, a.y - ny * hw);
    g.closePath();
  }
  g.fill({ texture: assets.asphalt, alpha: 0.92 });

  // Edge neon
  for (let i = 0; i < samples.length - 1; i += 2) {
    const a = samples[i]!;
    const b = samples[i + 1] ?? a;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    for (const side of [-1, 1]) {
      g.moveTo(a.x + nx * hw * side, a.y + ny * hw * side);
      g.lineTo(b.x + nx * hw * side, b.y + ny * hw * side);
      g.stroke({ color: track.accentColor, width: 2, alpha: 0.65 });
    }
  }

  // Center dashed line
  for (let i = 0; i < samples.length - 1; i += 3) {
    const a = samples[i]!;
    const b = samples[i + 1] ?? a;
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke({ color: 0xffffff, width: 2, alpha: 0.35 });
  }

  const s0 = samples[0]!;
  g.rect(s0.x - 44, s0.y - 10, 88, 20).fill({ color: 0xffffff, alpha: 0.85 });
  for (let i = 0; i < 8; i++) {
    g.rect(s0.x - 40 + i * 10, s0.y - 8, 5, 16).fill(i % 2 === 0 ? 0x111111 : 0xffffff);
  }
}
