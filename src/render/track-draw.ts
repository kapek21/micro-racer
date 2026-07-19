import type { Graphics } from 'pixi.js';
import type { TrackDef } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import type { ProceduralAssets } from './sprite-atlas.js';

export function drawBiome(g: Graphics, track: TrackDef, t: number): void {
  // Radial gradient feel via layered fills
  g.rect(0, 0, 1200, 800).fill(track.bgColor);
  g.circle(600, 400, 520).fill({ color: track.accentColor, alpha: 0.07 });
  g.circle(600, 400, 320).fill({ color: track.accentColor, alpha: 0.05 });

  const pulse = 0.5 + 0.5 * Math.sin(t * 0.002);
  for (let x = 0; x <= 1200; x += 40) {
    g.moveTo(x, 0);
    g.lineTo(x, 800);
    g.stroke({ color: track.accentColor, width: 1, alpha: 0.035 + pulse * 0.015 });
  }
  for (let y = 0; y <= 800; y += 40) {
    g.moveTo(0, y);
    g.lineTo(1200, y);
    g.stroke({ color: track.accentColor, width: 1, alpha: 0.035 + pulse * 0.015 });
  }

  g.rect(30, 30, 1140, 740).fill({ color: track.accentColor, alpha: 0.05 });
  g.rect(50, 50, 1100, 700).fill({ color: 0x000000, alpha: 0.14 });

  switch (track.biome) {
    case 'garden':
      g.circle(600, 400, 260).fill({ color: 0x208040, alpha: 0.12 });
      g.circle(600, 400, 180).fill({ color: 0x30a050, alpha: 0.06 });
      break;
    case 'living':
      g.roundRect(380, 280, 440, 240, 20).fill({ color: 0xff40ff, alpha: 0.07 + pulse * 0.05 });
      break;
    case 'security':
      g.rect(100, 100, 1000, 600).stroke({ color: 0xff4080, width: 2, alpha: 0.14 + pulse * 0.06 });
      break;
    case 'garage':
      g.roundRect(180, 150, 840, 500, 12).stroke({ color: 0xffa030, width: 2, alpha: 0.18 + pulse * 0.06 });
      break;
    case 'city':
      for (let i = 0; i < 10; i++) {
        const h = 60 + (i % 4) * 28;
        g.rect(120 + i * 100, 560 - h, 36, h).fill({ color: 0x203050, alpha: 0.45 });
      }
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
  t: number,
  opts?: { photoMode?: boolean },
): void {
  // Lovable track art already paints asphalt + kerbs — do not overlay a procedural ribbon.
  if (opts?.photoMode) {
    return;
  }

  const hw = track.trackWidth * 0.5;
  const kerbW = 14;
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.004);
  const dashOffset = (t * 0.08) % 48;

  // Outer kerbs with neon glow pass
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const stripes = Math.max(1, Math.floor(segLen / 16));
    for (const side of [-1, 1]) {
      for (let s = 0; s < stripes; s++) {
        const t0 = s / stripes;
        const t1 = (s + 1) / stripes;
        const ox = nx * (hw + kerbW * 0.5) * side;
        const oy = ny * (hw + kerbW * 0.5) * side;
        const x1 = a.x + (b.x - a.x) * t0 + ox;
        const y1 = a.y + (b.y - a.y) * t0 + oy;
        const x2 = a.x + (b.x - a.x) * t1 + ox;
        const y2 = a.y + (b.y - a.y) * t1 + oy;
        const kerbColor = (Math.floor(i + s + (side > 0 ? 0 : 1)) % 2 === 0) ? 0xff3355 : 0xf0f0f0;
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke({ color: kerbColor, width: kerbW, alpha: 0.92 });
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke({ color: kerbColor, width: kerbW + 6, alpha: 0.12 + pulse * 0.08 });
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
  g.fill({ texture: assets.asphalt, alpha: 0.94 });

  // Inner shadow edge
  for (let i = 0; i < samples.length - 1; i += 2) {
    const a = samples[i]!;
    const b = samples[i + 1] ?? a;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    for (const side of [-1, 1]) {
      g.moveTo(a.x + nx * (hw - 4) * side, a.y + ny * (hw - 4) * side);
      g.lineTo(b.x + nx * (hw - 4) * side, b.y + ny * (hw - 4) * side);
      g.stroke({ color: 0x000000, width: 3, alpha: 0.15 });
    }
  }

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
      g.stroke({ color: track.accentColor, width: 2.5, alpha: 0.55 + pulse * 0.25 });
    }
  }

  // Animated center dashes
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1] ?? a;
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const dashes = Math.floor(segLen / 24);
    for (let d = 0; d < dashes; d++) {
      const phase = (d * 24 + dashOffset) % 48;
      if (phase > 24) continue;
      const t0 = d / dashes;
      const t1 = Math.min(1, t0 + 0.04);
      const x1 = a.x + (b.x - a.x) * t0;
      const y1 = a.y + (b.y - a.y) * t0;
      const x2 = a.x + (b.x - a.x) * t1;
      const y2 = a.y + (b.y - a.y) * t1;
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke({ color: 0xffffff, width: 2, alpha: 0.45 + pulse * 0.15 });
    }
  }

  const s0 = samples[0]!;
  g.rect(s0.x - 48, s0.y - 12, 96, 24).fill({ color: 0xffffff, alpha: 0.9 });
  for (let i = 0; i < 10; i++) {
    g.rect(s0.x - 44 + i * 9, s0.y - 9, 4.5, 18).fill(i % 2 === 0 ? 0x111111 : 0xffffff);
  }
  g.rect(s0.x - 48, s0.y - 12, 96, 24).stroke({ color: track.accentColor, width: 2, alpha: 0.6 });
}
