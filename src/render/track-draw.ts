import type { Graphics } from 'pixi.js';
import type { TrackDef } from '../core/types.js';
import type { TrackSample } from '../physics/track-math.js';
import { tableTheme } from '../config/table-themes.js';
import type { ProceduralAssets } from './sprite-atlas.js';
import { tablePhotoTexture } from './table-photo.js';

const WORLD_W = 1200;
const WORLD_H = 800;

export function drawBiome(g: Graphics, track: TrackDef, t: number, _assets: ProceduralAssets): void {
  const theme = tableTheme(track.biome);
  const photo = tablePhotoTexture(track.biome);

  // Full photorealistic table render (cached canvas per biome)
  g.rect(0, 0, WORLD_W, WORLD_H).fill({ texture: photo, alpha: 1 });

  // Live lamp flicker overlay
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.0012);
  g.circle(600, 340, 300).fill({ color: theme.lampColor, alpha: 0.03 + pulse * 0.02 });

  drawTableClutter(g, track, t);
}

function drawTableClutter(g: Graphics, track: TrackDef, t: number): void {
  switch (track.biome) {
    case 'city':
      drawPoolBalls(g, 80, 60);
      drawCueStick(g, WORLD_W - 120, 70, -0.3);
      drawCueStick(g, WORLD_W - 90, 90, -0.15);
      break;
    case 'kitchen':
      drawSaltPepper(g, 70, WORLD_H - 90);
      drawMug(g, WORLD_W - 85, WORLD_H - 100);
      break;
    case 'desk':
      drawPencil(g, 65, 55);
      drawPencil(g, 85, 62, 0.4);
      drawEraser(g, WORLD_W - 75, 65);
      break;
    case 'living':
      drawRemote(g, 60, WORLD_H - 85);
      drawCoaster(g, WORLD_W - 70, WORLD_H - 75);
      break;
    case 'garden':
      drawFlowerPot(g, 55, 55);
      drawFlowerPot(g, WORLD_W - 80, WORLD_H - 85, 0.8);
      break;
    case 'garage':
      drawWrench(g, 60, WORLD_H - 80);
      drawBolt(g, WORLD_W - 65, 60);
      break;
    case 'roof':
      drawSunIcon(g, WORLD_W - 90, 55, t);
      break;
    case 'balcony':
      drawRailing(g, 40, 200, WORLD_H - 400);
      break;
    default:
      break;
  }
}

function drawPoolBalls(g: Graphics, x: number, y: number): void {
  const colors = [0xff2020, 0xffff20, 0x2040ff, 0xffffff, 0x202020];
  for (let i = 0; i < 5; i++) {
    const bx = x + i * 22;
    g.circle(bx, y + (i % 2) * 8, 10).fill({ color: 0x000000, alpha: 0.35 });
    g.circle(bx, y + (i % 2) * 8, 9).fill({ color: colors[i]!, alpha: 1 });
    g.circle(bx - 2, y + (i % 2) * 8 - 2, 3).fill({ color: 0xffffff, alpha: 0.5 });
  }
}

function drawCueStick(g: Graphics, x: number, y: number, angle: number): void {
  const len = 110;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  g.moveTo(x, y);
  g.lineTo(x + cos * len, y + sin * len);
  g.stroke({ color: 0xc8a060, width: 5, alpha: 0.95 });
  g.moveTo(x + cos * len * 0.85, y + sin * len * 0.85);
  g.lineTo(x + cos * len, y + sin * len);
  g.stroke({ color: 0x2040a0, width: 6, alpha: 0.9 });
}

function drawSaltPepper(g: Graphics, x: number, y: number): void {
  g.roundRect(x, y, 14, 28, 4).fill({ color: 0xf0f0f0, alpha: 0.95 });
  g.roundRect(x + 20, y + 4, 14, 24, 4).fill({ color: 0x303030, alpha: 0.95 });
}

function drawMug(g: Graphics, x: number, y: number): void {
  g.roundRect(x, y, 28, 22, 4).fill({ color: 0xe04040, alpha: 0.95 });
  g.circle(x + 32, y + 11, 8).stroke({ color: 0xe04040, width: 3, alpha: 0.9 });
}

function drawPencil(g: Graphics, x: number, y: number, angle = -0.5): void {
  const len = 50;
  g.moveTo(x, y);
  g.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
  g.stroke({ color: 0xffc040, width: 4, alpha: 0.9 });
  g.moveTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
  g.lineTo(x + Math.cos(angle) * (len + 8), y + Math.sin(angle) * (len + 8));
  g.stroke({ color: 0xff8060, width: 4, alpha: 0.85 });
}

function drawEraser(g: Graphics, x: number, y: number): void {
  g.roundRect(x, y, 24, 14, 3).fill({ color: 0xff8090, alpha: 0.9 });
}

function drawRemote(g: Graphics, x: number, y: number): void {
  g.roundRect(x, y, 36, 16, 4).fill({ color: 0x303030, alpha: 0.95 });
  for (let i = 0; i < 4; i++) {
    g.circle(x + 8 + i * 7, y + 8, 2).fill({ color: 0x606060, alpha: 0.9 });
  }
}

function drawCoaster(g: Graphics, x: number, y: number): void {
  g.circle(x, y, 14).fill({ color: 0x8b6040, alpha: 0.9 });
  g.circle(x, y, 10).stroke({ color: 0x604030, width: 1, alpha: 0.6 });
}

function drawFlowerPot(g: Graphics, x: number, y: number, scale = 1): void {
  const s = scale;
  g.roundRect(x - 12 * s, y, 24 * s, 20 * s, 3).fill({ color: 0x8b5030, alpha: 0.95 });
  g.circle(x, y - 6 * s, 14 * s).fill({ color: 0x40a040, alpha: 0.9 });
  g.circle(x - 5 * s, y - 10 * s, 5 * s).fill({ color: 0xff6080, alpha: 0.85 });
  g.circle(x + 6 * s, y - 8 * s, 4 * s).fill({ color: 0xffff60, alpha: 0.85 });
}

function drawWrench(g: Graphics, x: number, y: number): void {
  g.moveTo(x, y);
  g.lineTo(x + 40, y - 20);
  g.stroke({ color: 0x909090, width: 5, alpha: 0.9 });
  g.circle(x + 42, y - 22, 7).stroke({ color: 0x909090, width: 4, alpha: 0.9 });
}

function drawBolt(g: Graphics, x: number, y: number): void {
  g.circle(x, y, 8).fill({ color: 0xb0b0b0, alpha: 0.95 });
  g.moveTo(x - 4, y);
  g.lineTo(x + 4, y);
  g.stroke({ color: 0x707070, width: 1.5, alpha: 0.8 });
}

function drawSunIcon(g: Graphics, x: number, y: number, t: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.003);
  g.circle(x, y, 16).fill({ color: 0xffd040, alpha: 0.7 + pulse * 0.2 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.moveTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20);
    g.lineTo(x + Math.cos(a) * 28, y + Math.sin(a) * 28);
    g.stroke({ color: 0xffd040, width: 2, alpha: 0.5 + pulse * 0.3 });
  }
}

function drawRailing(g: Graphics, x: number, y: number, h: number): void {
  g.rect(x, y, 6, h).fill({ color: 0x8090a0, alpha: 0.7 });
  for (let i = 0; i < 5; i++) {
    g.rect(x, y + i * (h / 4), 30, 4).fill({ color: 0x8090a0, alpha: 0.6 });
  }
}

export function drawTrack(
  g: Graphics,
  track: TrackDef,
  samples: TrackSample[],
  _assets: ProceduralAssets,
  t: number,
): void {
  const theme = tableTheme(track.biome);
  const hw = track.trackWidth * 0.5;
  const bumperW = 10;
  const dashOffset = (t * 0.05) % 40;

  // Worn lane on table surface
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
  g.fill({ color: theme.laneMark, alpha: 0.42 });

  // Rubber / wood bumpers
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    for (const side of [-1, 1]) {
      const off = hw + bumperW * 0.5;
      g.moveTo(a.x + nx * off * side, a.y + ny * off * side);
      g.lineTo(b.x + nx * off * side, b.y + ny * off * side);
      g.stroke({ color: theme.railHighlight, width: bumperW, alpha: 0.8 });
    }
  }

  for (let i = 0; i < samples.length - 1; i += 2) {
    const a = samples[i]!;
    const b = samples[i + 1] ?? a;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    for (const side of [-1, 1]) {
      g.moveTo(a.x + nx * (hw - 3) * side, a.y + ny * (hw - 3) * side);
      g.lineTo(b.x + nx * (hw - 3) * side, b.y + ny * (hw - 3) * side);
      g.stroke({ color: 0x000000, width: 2, alpha: 0.14 });
    }
  }

  // Chalk centre line
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1] ?? a;
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);
    const dashes = Math.floor(segLen / 22);
    for (let d = 0; d < dashes; d++) {
      const phase = (d * 22 + dashOffset) % 44;
      if (phase > 22) continue;
      const t0 = d / dashes;
      const t1 = Math.min(1, t0 + 0.035);
      g.moveTo(a.x + (b.x - a.x) * t0, a.y + (b.y - a.y) * t0);
      g.lineTo(a.x + (b.x - a.x) * t1, a.y + (b.y - a.y) * t1);
      g.stroke({ color: theme.lineColor, width: 1.5, alpha: 0.5 });
    }
  }

  const s0 = samples[0]!;
  const ang0 = Math.atan2((samples[1]?.y ?? s0.y) - s0.y, (samples[1]?.x ?? s0.x) - s0.x);
  const nx0 = -Math.sin(ang0);
  const ny0 = Math.cos(ang0);
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 10; col++) {
      const cx = s0.x + nx0 * (row * 10 - 5) + Math.cos(ang0) * (col * 9 - 40);
      const cy = s0.y + ny0 * (row * 10 - 5) + Math.sin(ang0) * (col * 9 - 40);
      const chk = (row + col) % 2 === 0;
      g.rect(cx - 4, cy - 4, 8, 8).fill({ color: chk ? 0x111111 : 0xf0f0f0, alpha: 0.88 });
    }
  }
}
