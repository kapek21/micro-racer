import { Texture } from 'pixi.js';
import { tableTheme, type TableTheme } from '../config/table-themes.js';

const PHOTO_VERSION = 3;
const cache = new Map<string, Texture>();

export function tablePhotoTexture(biome: string): Texture {
  const key = `${biome}_v${PHOTO_VERSION}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const theme = tableTheme(biome);
  const tex = Texture.from(renderTableCanvas(theme, biome));
  cache.set(key, tex);
  return tex;
}

function renderTableCanvas(theme: TableTheme, biome: string): HTMLCanvasElement {
  const scale = 2;
  const w = 1200;
  const h = 800;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawRoomFloor(ctx, w, h);
  drawTableShadow(ctx, w, h);
  drawWoodRailPhoto(ctx, 16, 20, w - 32, h - 40, theme);
  drawSurfacePhoto(ctx, 52, 56, w - 104, h - 112, theme, biome);
  drawLampPool(ctx, w, h, theme);
  drawEdgeWear(ctx, 52, 56, w - 104, h - 112);
  if (theme.pocketRadius > 0) drawPocketsPhoto(ctx, theme);
  return canvas;
}

function drawRoomFloor(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#221810');
  g.addColorStop(0.55, '#140e08');
  g.addColorStop(1, '#0a0804');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Parquet planks
  for (let y = 0; y < h; y += 14) {
    const shade = 0.06 + (y % 28) * 0.004;
    ctx.fillStyle = `rgba(80,55,30,${shade})`;
    ctx.fillRect(0, y, w, 7);
    for (let x = (y % 28); x < w; x += 56) {
      ctx.strokeStyle = `rgba(0,0,0,${0.12 + (x % 112) * 0.0005})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 14);
      ctx.stroke();
    }
  }
}

function drawTableShadow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = '#000';
  roundRect(ctx, 24, 28, w - 48, h - 56, 18);
  ctx.fill();
  ctx.restore();
}

function drawWoodRailPhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: TableTheme,
): void {
  const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, hex(theme.railHighlight));
  g.addColorStop(0.35, hex(theme.rail));
  g.addColorStop(0.7, hex(theme.railShadow));
  g.addColorStop(1, hex(theme.railHighlight));
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  // Grain
  for (let i = 0; i < 40; i++) {
    const gy = y + 8 + (i / 40) * (h - 16);
    ctx.strokeStyle = `rgba(0,0,0,${0.06 + (i % 3) * 0.03})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, gy);
    ctx.bezierCurveTo(x + w * 0.3, gy + 2, x + w * 0.7, gy - 1, x + w - 6, gy + 1);
    ctx.stroke();
  }
  // Top bevel highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  roundRect(ctx, x + 5, y + 4, w - 10, h - 12, 10);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 36, y + 32, w - 72, h - 64, 8);
  ctx.stroke();
  // Inner rail shadow (ambient occlusion)
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 6;
  roundRect(ctx, x + 38, y + 34, w - 76, h - 68, 7);
  ctx.stroke();
  // Specular strip on rail top
  ctx.strokeStyle = 'rgba(255,230,200,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 8, y + 6, w - 16, h - 14, 11);
  ctx.stroke();
}

function drawSurfacePhoto(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: TableTheme,
  biome: string,
): void {
  const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
  const base = ctx.createRadialGradient(x + w * 0.5, y + h * 0.45, 40, x + w * 0.5, y + h * 0.45, w * 0.75);
  base.addColorStop(0, lighten(theme.surface, 0.08));
  base.addColorStop(0.55, hex(theme.surface));
  base.addColorStop(1, hex(theme.surfaceAlt));
  ctx.fillStyle = base;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();

  switch (theme.texture) {
    case 'felt':
      drawFeltNoise(ctx, x, y, w, h);
      break;
    case 'wood':
      drawWoodSurface(ctx, x, y, w, h, theme);
      break;
    case 'laminate':
      drawLaminateSurface(ctx, x, y, w, h);
      break;
    case 'tile':
      drawTileSurface(ctx, x, y, w, h);
      break;
    case 'concrete':
      drawConcreteSurface(ctx, x, y, w, h);
      break;
    case 'grass':
      drawGrassSurface(ctx, x, y, w, h);
      break;
  }

  // Subtle biome wear
  if (biome === 'kitchen') {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, x + 80, y + 60, w - 160, h - 120, 8);
    ctx.fill();
  }
}

function drawFeltNoise(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  for (let i = 0; i < 28000; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${Math.random() * 0.045})` : `rgba(0,0,0,${Math.random() * 0.055})`;
    ctx.fillRect(px, py, 1, 1 + Math.random() * 2);
  }
  for (let row = 0; row < h; row += 2) {
    ctx.fillStyle = `rgba(0,0,0,${0.006 + (row % 4) * 0.002})`;
    ctx.fillRect(x, y + row, w, 1);
  }
  // Brushed felt direction
  for (let i = 0; i < 80; i++) {
    const py = y + (i / 80) * h;
    ctx.strokeStyle = `rgba(0,0,0,${0.015})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py + Math.sin(i * 0.3) * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEdgeWear(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 8);
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 12;
  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 6);
  ctx.stroke();
  ctx.restore();
}

function drawWoodSurface(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, _theme: TableTheme): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  for (let i = 0; i < 50; i++) {
    const gy = y + (i / 50) * h;
    ctx.strokeStyle = `rgba(40,20,8,${0.05 + (i % 4) * 0.02})`;
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.bezierCurveTo(x + w * 0.25, gy + 3, x + w * 0.75, gy - 2, x + w, gy + 1);
    ctx.stroke();
  }
  // Knot
  ctx.fillStyle = 'rgba(60,30,10,0.15)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.7, y + h * 0.35, 18, 12, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLaminateSurface(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.035})`;
    ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 2, 1);
  }
  ctx.restore();
}

function drawTileSurface(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const ts = 32;
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  for (let tx = 0; tx < w; tx += ts) {
    for (let ty = 0; ty < h; ty += ts) {
      const shade = ((tx / ts + ty / ts) % 2) * 0.03;
      ctx.fillStyle = `rgba(255,255,255,${shade})`;
      ctx.fillRect(x + tx, y + ty, ts - 1, ts - 1);
    }
  }
  ctx.strokeStyle = 'rgba(80,90,100,0.25)';
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= w; tx += ts) {
    ctx.beginPath();
    ctx.moveTo(x + tx, y);
    ctx.lineTo(x + tx, y + h);
    ctx.stroke();
  }
  for (let ty = 0; ty <= h; ty += ts) {
    ctx.beginPath();
    ctx.moveTo(x, y + ty);
    ctx.lineTo(x + w, y + ty);
    ctx.stroke();
  }
  ctx.restore();
}

function drawConcreteSurface(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 1.5, 1.5);
  }
  ctx.restore();
}

function drawGrassSurface(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  for (let i = 0; i < 4000; i++) {
    const px = x + Math.random() * w;
    const py = y + Math.random() * h;
    ctx.strokeStyle = `rgba(${30 + Math.random() * 40},${100 + Math.random() * 50},${40 + Math.random() * 20},0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (Math.random() - 0.5) * 4, py - 2 - Math.random() * 5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLampPool(ctx: CanvasRenderingContext2D, w: number, h: number, theme: TableTheme): void {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 20, w * 0.5, h * 0.42, w * 0.55);
  g.addColorStop(0, hexAlpha(theme.lampColor, 0.22));
  g.addColorStop(0.45, hexAlpha(theme.lampColor, 0.08));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, 0, w, 60);
  ctx.fillRect(0, h - 80, w, 80);
}

function drawPocketsPhoto(ctx: CanvasRenderingContext2D, theme: TableTheme): void {
  const r = theme.pocketRadius;
  const pts: [number, number][] = [
    [64, 68], [1136, 68], [64, 732], [1136, 732], [600, 56], [600, 744],
  ];
  for (const [px, py] of pts) {
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(px, py, r + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,100,0.12)';
    ctx.beginPath();
    ctx.arc(px - 2, py - 2, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexAlpha(hex: number, a: number): string {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function lighten(hex: number, amt: number): string {
  const r = Math.min(255, ((hex >> 16) & 255) + amt * 255);
  const g = Math.min(255, ((hex >> 8) & 255) + amt * 255);
  const b = Math.min(255, (hex & 255) + amt * 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
