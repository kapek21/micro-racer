import { Texture } from 'pixi.js';
import type { VehicleClass } from '../core/types.js';
import { VEHICLES } from '../config/vehicles.js';
import { POWERUPS } from '../config/powerups.js';
import { powerUpVisual } from '../config/powerup-visuals.js';
import { createBiomeTextures } from './biome-sprites.js';

export interface SpriteAtlas {
  asphalt: Texture;
  felt: Texture;
  wood: Texture;
  laminate: Texture;
  concrete: Texture;
  tile: Texture;
  grass: Texture;
  kerb: Texture;
  glow: Texture;
  shadow: Texture;
  vehicles: Record<string, Texture>;
  vacuum: Texture;
  mower: Texture;
  drone: Texture;
  pickup: Texture;
  pickupGlow: Texture;
  token: Texture;
  mine: Texture;
  boostPad: Texture;
  boostPadGlow: Texture;
  conveyor: Texture;
  biomes: Record<string, Texture>;
  tables: Record<string, Texture>;
  powerups: Record<string, Texture>;
}

export function createSpriteAtlas(): SpriteAtlas {
  const vehicles: Record<string, Texture> = {};
  for (const v of VEHICLES) {
    vehicles[v.id] = canvasTex((ctx, w, h) => drawVehicleSprite(ctx, w, h, v.class, v.color, v.accent), 112, 64);
  }

  const powerups: Record<string, Texture> = {};
  for (const p of POWERUPS) {
    const vis = powerUpVisual(p.id);
    powerups[p.id] = canvasTex((ctx, w, h) => drawPowerUpIcon(ctx, w, h, vis), 56, 56);
  }

  return {
    asphalt: canvasTex(drawAsphalt, 128, 128),
    felt: canvasTex(drawFelt, 128, 128),
    wood: canvasTex(drawWoodGrain, 128, 128),
    laminate: canvasTex(drawLaminate, 128, 128),
    concrete: canvasTex(drawConcrete, 128, 128),
    tile: canvasTex(drawTile, 128, 128),
    grass: canvasTex(drawGrass, 128, 128),
    kerb: canvasTex(drawKerb, 64, 16),
    glow: canvasTex(drawGlow, 64, 64),
    shadow: canvasTex(drawShadow, 64, 32),
    vehicles,
    vacuum: canvasTex(drawVacuum, 56, 56),
    mower: canvasTex(drawMower, 56, 56),
    drone: canvasTex(drawDrone, 48, 48),
    pickup: canvasTex(drawPickup, 40, 40),
    pickupGlow: canvasTex(drawPickupGlow, 44, 44),
    token: canvasTex(drawToken, 36, 36),
    mine: canvasTex(drawMine, 32, 32),
    boostPad: canvasTex(drawBoostPad, 64, 32),
    boostPadGlow: canvasTex(drawBoostPadGlow, 68, 36),
    conveyor: canvasTex(drawConveyor, 64, 28),
    biomes: createBiomeTextures(192),
    tables: {},
    powerups,
  };
}

function hex(c: number): string {
  return `#${c.toString(16).padStart(6, '0')}`;
}

function lightenHex(c: number, amt: number): string {
  const r = Math.min(255, ((c >> 16) & 255) + amt * 255);
  const g = Math.min(255, ((c >> 8) & 255) + amt * 255);
  const b = Math.min(255, (c & 255) + amt * 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function darkenHex(c: number, amt: number): string {
  const r = Math.max(0, ((c >> 16) & 255) * (1 - amt));
  const g = Math.max(0, ((c >> 8) & 255) * (1 - amt));
  const b = Math.max(0, (c & 255) * (1 - amt));
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function canvasTex(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  w: number,
  h: number,
): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.WHITE;
  draw(ctx, w, h);
  return Texture.from(canvas);
}

function drawFelt(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#1a6b3a';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 1200; i++) {
    const a = Math.random() * 0.08;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 0.6})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 2);
  }
  for (let y = 0; y < h; y += 3) {
    ctx.fillStyle = `rgba(0,0,0,${0.015 + (y % 6) * 0.003})`;
    ctx.fillRect(0, y, w, 1);
  }
}

function drawWoodGrain(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#a88858');
  g.addColorStop(0.5, '#c4a574');
  g.addColorStop(1, '#a88858');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 24; i++) {
    const y = (i / 24) * h;
    ctx.strokeStyle = `rgba(60,30,10,${0.08 + (i % 3) * 0.04})`;
    ctx.lineWidth = 1 + (i % 2);
    ctx.beginPath();
    ctx.moveTo(0, y + Math.sin(i) * 2);
    ctx.bezierCurveTo(w * 0.3, y + 4, w * 0.7, y - 2, w, y + 1);
    ctx.stroke();
  }
}

function drawLaminate(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#e8e0d4';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 1);
  }
}

function drawConcrete(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#707880';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}

function drawTile(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#b0b8c0';
  ctx.fillRect(0, 0, w, h);
  const ts = 16;
  ctx.strokeStyle = 'rgba(80,90,100,0.35)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += ts) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += ts) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawGrass(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#2d7a4a';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.strokeStyle = `rgba(${40 + Math.random() * 30},${120 + Math.random() * 40},${50 + Math.random() * 20},0.35)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 4);
    ctx.stroke();
  }
}

function drawAsphalt(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#4a5568');
  g.addColorStop(1, '#3d4654');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}

function drawKerb(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const stripe = w / 4;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#ff3355' : '#f0f0f0';
    ctx.fillRect(i * stripe, 0, stripe, h);
  }
}

function drawGlow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(64,224,255,0.55)');
  g.addColorStop(1, 'rgba(64,224,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawShadow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w * 0.48, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawVehicleSprite(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cls: VehicleClass,
  color: number,
  accent: number,
): void {
  const trim = hex(accent);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);

  // Contact shadow under body
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.22, w * 0.32, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels — rubber with rim highlight
  for (const [wx, wy] of [
    [-0.28, -0.32],
    [0.28, -0.32],
    [-0.28, 0.32],
    [0.28, 0.32],
  ] as const) {
    const px = wx * w;
    const py = wy * h;
    ctx.fillStyle = '#0a0a10';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2a32';
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px - 1, py - 1, 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  const bodyGrad = ctx.createLinearGradient(-w * 0.35, -h * 0.3, w * 0.35, h * 0.3);
  bodyGrad.addColorStop(0, lightenHex(color, 0.22));
  bodyGrad.addColorStop(0.45, hex(color));
  bodyGrad.addColorStop(1, darkenHex(color, 0.18));
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = trim;
  ctx.lineWidth = 1.5;

  if (cls === 'heavy') {
    ctx.beginPath();
    ctx.roundRect(-w * 0.34, -h * 0.28, w * 0.68, h * 0.56, 6);
    ctx.fill();
    ctx.stroke();
  } else if (cls === 'speed') {
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h * 0.22);
    ctx.lineTo(w * 0.08, -h * 0.28);
    ctx.lineTo(w * 0.38, 0);
    ctx.lineTo(w * 0.08, h * 0.28);
    ctx.lineTo(-w * 0.28, h * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff6688';
    ctx.fillRect(w * 0.22, -h * 0.08, w * 0.1, h * 0.16);
  } else if (cls === 'agile') {
    ctx.beginPath();
    ctx.moveTo(-w * 0.26, -h * 0.24);
    ctx.lineTo(w * 0.3, -h * 0.2);
    ctx.lineTo(w * 0.34, 0);
    ctx.lineTo(w * 0.3, h * 0.2);
    ctx.lineTo(-w * 0.26, h * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h * 0.24);
    ctx.lineTo(w * 0.28, -h * 0.24);
    ctx.lineTo(w * 0.32, 0);
    ctx.lineTo(w * 0.28, h * 0.24);
    ctx.lineTo(-w * 0.28, h * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Windshield with reflection
  const glass = ctx.createLinearGradient(w * 0.02, -h * 0.12, w * 0.2, h * 0.12);
  glass.addColorStop(0, 'rgba(200,240,255,0.95)');
  glass.addColorStop(0.5, 'rgba(120,180,220,0.75)');
  glass.addColorStop(1, 'rgba(80,140,180,0.65)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.roundRect(w * 0.02, -h * 0.12, w * 0.18, h * 0.24, 3);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#ffffcc';
  ctx.beginPath();
  ctx.arc(w * 0.34, -h * 0.14, 3, 0, Math.PI * 2);
  ctx.arc(w * 0.34, h * 0.14, 3, 0, Math.PI * 2);
  ctx.fill();

  // Roof accent stripe
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, 0);
  ctx.lineTo(w * 0.2, 0);
  ctx.stroke();

  ctx.restore();
}

function drawVacuum(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#253040';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#40a0c0';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#80ffff';
  ctx.beginPath();
  ctx.arc(w * 0.35, h * 0.38, 4, 0, Math.PI * 2);
  ctx.arc(w * 0.65, h * 0.38, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#60d0ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
  ctx.stroke();
}

function drawMower(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#2a4030';
  ctx.fillRect(w * 0.15, h * 0.2, w * 0.7, h * 0.55);
  ctx.fillStyle = '#40e040';
  ctx.fillRect(w * 0.2, h * 0.65, w * 0.6, h * 0.12);
  ctx.fillStyle = '#ffcc40';
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.38, w * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function drawDrone(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#6070a0';
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.15);
  ctx.lineTo(w * 0.85, h * 0.75);
  ctx.lineTo(w * 0.15, h * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a0b0ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ff4040';
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.55, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPickup(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ff80c0');
  g.addColorStop(1, '#cc2080');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Orbitron,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡', w / 2, h / 2 + 1);
}

function drawPickupGlow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  drawPickup(ctx, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.5);
  g.addColorStop(0, 'rgba(64,224,255,0.55)');
  g.addColorStop(1, 'rgba(64,224,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawToken(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#ffd040';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const x = w / 2 + Math.cos(a) * w * 0.38;
    const y = h / 2 + Math.sin(a) * h * 0.38;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawMine(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#331111';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff2020';
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.strokeStyle = '#ff8080';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 + Math.cos(a) * w * 0.15, h / 2 + Math.sin(a) * h * 0.15);
    ctx.lineTo(w / 2 + Math.cos(a) * w * 0.45, h / 2 + Math.sin(a) * h * 0.45);
    ctx.stroke();
  }
}

function drawBoostPad(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#403010';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffd040';
  ctx.fillRect(4, 4, w - 8, h - 8);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡', w / 2, h / 2);
}

function drawBoostPadGlow(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  drawBoostPad(ctx, w, h);
  ctx.fillStyle = 'rgba(64,255,128,0.35)';
  ctx.fillRect(2, 2, w - 4, h - 4);
}

function drawConveyor(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#505868';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#707880';
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(i * (w / 6) + 2, 4, w / 6 - 4, h - 8);
  }
}

function drawPowerUpIcon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  vis: ReturnType<typeof powerUpVisual>,
): void {
  const cx = w / 2;
  const cy = h / 2;
  const body = hex(vis.color);
  const glow = hex(vis.glow);
  const ring = hex(vis.ring);

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.48);
  g.addColorStop(0, glow);
  g.addColorStop(0.55, body);
  g.addColorStop(1, ring);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76, 10);
  ctx.fill();

  ctx.strokeStyle = glow;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Orbitron,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(vis.symbol, cx, cy + 1);

  if (vis.rarity === 'epic' || vis.rarity === 'rare') {
    ctx.strokeStyle = vis.rarity === 'epic' ? '#ffd040' : '#c0d0ff';
    ctx.lineWidth = vis.rarity === 'epic' ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.roundRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88, 12);
    ctx.stroke();
  }
}

/** @deprecated use createSpriteAtlas */
export const createProceduralAssets = (): ProceduralAssets => {
  const a = createSpriteAtlas();
  return {
    asphalt: a.asphalt,
    felt: a.felt,
    wood: a.wood,
    laminate: a.laminate,
    concrete: a.concrete,
    tile: a.tile,
    grass: a.grass,
    kerb: a.kerb,
    glow: a.glow,
  };
};

export type ProceduralAssets = Pick<
  SpriteAtlas,
  'asphalt' | 'felt' | 'wood' | 'laminate' | 'concrete' | 'tile' | 'grass' | 'kerb' | 'glow'
>;

export function surfaceTexture(assets: ProceduralAssets, kind: TableTextureKind): Texture {
  return assets[kind];
}

export type TableTextureKind = 'felt' | 'wood' | 'laminate' | 'concrete' | 'tile' | 'grass';
