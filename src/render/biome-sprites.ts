/**
 * Procedural biome prop textures (fallback when PNGs missing).
 * Keys match BIOME_SPRITE_URLS / asset-paths.ts.
 */
import { Texture } from 'pixi.js';

const BIOME_KEYS = [
  'kitchen_island',
  'kitchen_fridge',
  'roof_solar',
  'roof_ac',
  'garden_tree',
  'garden_lawn',
  'garage_charger',
  'garage_bench',
  'security_camera',
  'security_laser',
  'warehouse_shelf',
  'warehouse_pallet',
  'living_tv',
  'living_sofa',
  'balcony_planter',
  'balcony_sensor',
  'desk_setup',
  'desk_lamp',
  'city_towers',
  'city_lamp',
] as const;

export type BiomeSpriteKey = (typeof BIOME_KEYS)[number];

function hex(c: number): string {
  return `#${c.toString(16).padStart(6, '0')}`;
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

export function createBiomeTextures(size = 128): Record<string, Texture> {
  const out: Record<string, Texture> = {};
  for (const key of BIOME_KEYS) {
    out[key] = canvasTex((ctx, w, h) => drawBiomeProp(ctx, w, h, key), size, size);
  }
  return out;
}

export function drawBiomeProp(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  key: BiomeSpriteKey,
): void {
  ctx.clearRect(0, 0, w, h);
  const cx = w * 0.5;
  const cy = h * 0.58;

  switch (key) {
    case 'kitchen_island':
      ctx.fillStyle = '#8898a8';
      ctx.fillRect(cx - 38, cy - 8, 76, 28);
      ctx.fillStyle = '#c0d0e0';
      ctx.fillRect(cx - 34, cy - 12, 68, 8);
      ctx.fillStyle = '#40a0c0';
      ctx.fillRect(cx - 12, cy + 2, 24, 14);
      break;
    case 'kitchen_fridge':
      ctx.fillStyle = '#d0e0f0';
      ctx.fillRect(cx - 22, cy - 40, 44, 72);
      ctx.strokeStyle = '#6080a0';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 22, cy - 40, 44, 72);
      ctx.fillStyle = '#40c0ff';
      ctx.fillRect(cx - 16, cy - 28, 32, 4);
      ctx.fillRect(cx - 16, cy + 8, 32, 4);
      break;
    case 'roof_solar':
      ctx.fillStyle = '#203050';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(cx - 36 + i * 18, cy - 20, 16, 36);
      }
      ctx.fillStyle = '#1040a0';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(cx - 34 + i * 18, cy - 18, 12, 32);
      }
      ctx.strokeStyle = '#60a0ff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.strokeRect(cx - 34 + i * 18, cy - 18, 12, 32);
      }
      break;
    case 'roof_ac':
      ctx.fillStyle = '#708090';
      ctx.fillRect(cx - 28, cy - 16, 56, 32);
      ctx.fillStyle = '#506070';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - 24 + i * 10, cy - 12, 6, 24);
      }
      ctx.fillStyle = '#a0b0c0';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'garden_tree':
      ctx.fillStyle = '#503020';
      ctx.fillRect(cx - 6, cy - 4, 12, 28);
      ctx.fillStyle = '#208040';
      ctx.beginPath();
      ctx.arc(cx, cy - 24, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#30a050';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 28, 14, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 22, 12, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'garden_lawn':
      ctx.fillStyle = '#208030';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 40, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#40c050';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.fillRect(cx + Math.cos(a) * 22 - 2, cy + Math.sin(a) * 10 - 6, 4, 10);
      }
      break;
    case 'garage_charger':
      ctx.fillStyle = '#404050';
      ctx.fillRect(cx - 14, cy - 30, 28, 50);
      ctx.fillStyle = '#ffa030';
      ctx.fillRect(cx - 10, cy - 20, 20, 12);
      ctx.strokeStyle = '#40ff80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      break;
    case 'garage_bench':
      ctx.fillStyle = '#606878';
      ctx.fillRect(cx - 36, cy - 6, 72, 12);
      ctx.fillStyle = '#404858';
      ctx.fillRect(cx - 32, cy + 6, 8, 20);
      ctx.fillRect(cx + 24, cy + 6, 8, 20);
      ctx.fillStyle = '#8090a0';
      ctx.fillRect(cx - 28, cy - 14, 56, 8);
      break;
    case 'security_camera':
      ctx.fillStyle = '#303040';
      ctx.fillRect(cx - 4, cy - 30, 8, 24);
      ctx.fillStyle = '#505868';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 8, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff2040';
      ctx.beginPath();
      ctx.arc(cx + 14, cy - 8, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'security_laser':
      ctx.strokeStyle = '#ff4080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 20);
      ctx.lineTo(cx + 30, cy + 20);
      ctx.stroke();
      ctx.fillStyle = '#ff4080';
      ctx.beginPath();
      ctx.arc(cx - 30, cy - 20, 6, 0, Math.PI * 2);
      ctx.arc(cx + 30, cy + 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ff4080';
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 20);
      ctx.lineTo(cx + 30, cy + 20);
      ctx.lineTo(cx + 20, cy + 30);
      ctx.lineTo(cx - 40, cy - 10);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case 'warehouse_shelf':
      ctx.fillStyle = '#506070';
      ctx.fillRect(cx - 30, cy - 36, 60, 56);
      for (let row = 0; row < 3; row++) {
        ctx.fillStyle = row % 2 === 0 ? '#607080' : '#708090';
        ctx.fillRect(cx - 26, cy - 32 + row * 18, 52, 14);
      }
      break;
    case 'warehouse_pallet':
      ctx.fillStyle = '#806040';
      ctx.fillRect(cx - 28, cy - 8, 56, 10);
      ctx.fillRect(cx - 28, cy + 4, 56, 10);
      ctx.fillStyle = '#604830';
      ctx.fillRect(cx - 24, cy - 16, 48, 8);
      break;
    case 'living_tv':
      ctx.fillStyle = '#101018';
      ctx.fillRect(cx - 32, cy - 28, 64, 40);
      ctx.strokeStyle = '#ff40ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 32, cy - 28, 64, 40);
      ctx.fillStyle = '#8040a0';
      ctx.fillRect(cx - 26, cy - 22, 52, 28);
      ctx.fillStyle = '#404050';
      ctx.fillRect(cx - 8, cy + 12, 16, 10);
      break;
    case 'living_sofa':
      ctx.fillStyle = '#6040a0';
      ctx.fillRect(cx - 36, cy - 16, 72, 28);
      ctx.fillStyle = '#8050c0';
      ctx.fillRect(cx - 40, cy - 20, 12, 24);
      ctx.fillRect(cx + 28, cy - 20, 12, 24);
      ctx.fillStyle = '#9070d0';
      ctx.fillRect(cx - 30, cy - 22, 60, 8);
      break;
    case 'balcony_planter':
      ctx.fillStyle = '#806050';
      ctx.fillRect(cx - 24, cy, 48, 16);
      ctx.fillStyle = '#208030';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(cx - 16 + i * 8, cy - 8, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ff6080';
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'balcony_sensor':
      ctx.fillStyle = '#8090a0';
      ctx.fillRect(cx - 6, cy - 24, 12, 32);
      ctx.fillStyle = '#40c0ff';
      ctx.beginPath();
      ctx.arc(cx, cy - 28, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#80e0ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy - 28, 16, -0.8, 0.8);
      ctx.stroke();
      break;
    case 'desk_setup':
      ctx.fillStyle = '#303848';
      ctx.fillRect(cx - 36, cy - 8, 72, 8);
      ctx.fillStyle = '#101820';
      ctx.fillRect(cx - 20, cy - 32, 40, 24);
      ctx.fillStyle = '#2040a0';
      ctx.fillRect(cx - 16, cy - 28, 32, 18);
      ctx.fillStyle = '#505868';
      ctx.fillRect(cx - 4, cy, 8, 16);
      break;
    case 'desk_lamp':
      ctx.strokeStyle = '#8090a0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 16);
      ctx.lineTo(cx, cy - 16);
      ctx.lineTo(cx + 20, cy - 28);
      ctx.stroke();
      ctx.fillStyle = '#ffe080';
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 28);
      ctx.lineTo(cx + 36, cy - 20);
      ctx.lineTo(cx + 24, cy - 12);
      ctx.closePath();
      ctx.fill();
      break;
    case 'city_towers':
      ctx.fillStyle = hex(0x203050);
      ctx.fillRect(cx - 10, cy - 40, 20, 56);
      ctx.fillRect(cx - 28, cy - 28, 14, 44);
      ctx.fillRect(cx + 16, cy - 32, 14, 48);
      for (const ox of [-28, -10, 16]) {
        ctx.fillStyle = '#ffd040';
        for (let row = 0; row < 4; row++) {
          ctx.fillRect(cx + ox + 3, cy - 36 + row * 10, 4, 4);
          ctx.fillRect(cx + ox + 9, cy - 36 + row * 10, 4, 4);
        }
      }
      break;
    case 'city_lamp':
      ctx.fillStyle = '#506070';
      ctx.fillRect(cx - 3, cy - 8, 6, 32);
      ctx.fillStyle = '#ffe060';
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,224,96,0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 18, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, w - 4, h - 4);
}
