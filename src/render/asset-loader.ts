import { Texture } from 'pixi.js';
import {
  AI_VEHICLE_SPRITE_URLS,
  BIOME_SPRITE_URLS,
  POWERUP_ICON_URLS,
  TRACK_THUMB_URLS,
  VEHICLE_SPRITE_URLS,
} from '../config/asset-paths.js';
import { POWERUPS } from '../config/powerups.js';
import { createSpriteAtlas, type SpriteAtlas } from './sprite-atlas.js';
import { setTablePhotoTextures } from './table-photo.js';
import { setTrackBackgroundTextures } from './track-background.js';

const TABLE_BIOMES = [
  'kitchen',
  'roof',
  'garden',
  'garage',
  'balcony',
  'desk',
  'city',
  'living',
  'security',
  'warehouse',
] as const;

const KEY = { r: 6, g: 10, b: 20 };
const KEY_THRESHOLD = 38;
const KEY_FEATHER = 32;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

function chromaKey(data: ImageData): void {
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const dr = px[i]! - KEY.r;
    const dg = px[i + 1]! - KEY.g;
    const db = px[i + 2]! - KEY.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < KEY_THRESHOLD) {
      px[i + 3] = 0;
    } else if (dist < KEY_THRESHOLD + KEY_FEATHER) {
      const t = (dist - KEY_THRESHOLD) / KEY_FEATHER;
      px[i + 3] = Math.round(px[i + 3]! * t);
    }
  }
}

async function loadKeyedTexture(url: string, w: number, h = w): Promise<Texture> {
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.WHITE;

  const srcAspect = img.width / img.height;
  const dstAspect = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (srcAspect > dstAspect) {
    sw = img.height * dstAspect;
    sx = (img.width - sw) * 0.5;
  } else {
    sh = img.width / dstAspect;
    sy = (img.height - sh) * 0.5;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  // Only chroma-key when the image is mostly opaque (old Lovable scene frames).
  let transparent = 0;
  const px = imageData.data;
  for (let i = 3; i < px.length; i += 4) {
    if ((px[i] ?? 255) < 16) transparent += 1;
  }
  const alphaRatio = transparent / (w * h);
  if (alphaRatio < 0.08) chromaKey(imageData);
  ctx.putImageData(imageData, 0, 0);
  return Texture.from(canvas);
}

async function tryKeyed(
  url: string,
  w: number,
  h = w,
): Promise<Texture | null> {
  try {
    return await loadKeyedTexture(url, w, h);
  } catch {
    return null;
  }
}

async function loadTrackBackgrounds(): Promise<Record<string, Texture>> {
  const out: Record<string, Texture> = {};
  await Promise.all(
    Object.entries(TRACK_THUMB_URLS).map(async ([id, url]) => {
      try {
        const img = await loadImage(url);
        out[id] = Texture.from(img);
      } catch {
        console.warn(`[assets] track background missing: ${id}`);
      }
    }),
  );
  return out;
}

async function loadTablePhotos(): Promise<Record<string, Texture>> {
  const out: Record<string, Texture> = {};
  await Promise.all(
    TABLE_BIOMES.map(async (biome) => {
      try {
        const img = await loadImage(`/assets/sprites/tables/${biome}.png`);
        out[biome] = Texture.from(img);
      } catch {
        /* procedural fallback via table-photo.ts */
      }
    }),
  );
  return out;
}

async function loadBiomes(): Promise<Record<string, Texture>> {
  const biomes: Record<string, Texture> = {};
  await Promise.all(
    Object.entries(BIOME_SPRITE_URLS).map(async ([key, url]) => {
      const tex = await tryKeyed(url, 160, 160);
      if (tex) biomes[key] = tex;
      else console.warn(`[assets] biome sprite missing: ${key}`);
    }),
  );
  return biomes;
}

async function loadVehicles(
  procedural: SpriteAtlas,
): Promise<Record<string, Texture>> {
  const vehicles: Record<string, Texture> = { ...procedural.vehicles };
  const urls: Record<string, string> = {
    ...VEHICLE_SPRITE_URLS,
    ...AI_VEHICLE_SPRITE_URLS,
  };
  await Promise.all(
    Object.entries(urls).map(async ([id, url]) => {
      const tex = await tryKeyed(url, 128, 128);
      if (tex) vehicles[id] = tex;
    }),
  );
  return vehicles;
}

async function loadPowerupIcons(
  procedural: SpriteAtlas,
): Promise<Record<string, Texture>> {
  const powerups: Record<string, Texture> = { ...procedural.powerups };
  await Promise.all(
    POWERUPS.map(async (p) => {
      const url = POWERUP_ICON_URLS[p.id];
      if (!url) return;
      const tex = await tryKeyed(url, 56, 56);
      if (tex) powerups[p.id] = tex;
    }),
  );
  return powerups;
}

export async function loadSpriteAtlas(): Promise<SpriteAtlas> {
  try {
    const procedural = createSpriteAtlas();
    const [
      vacuum,
      mower,
      drone,
      conveyor,
      pickup,
      pickupGlow,
      token,
      mine,
      boostPad,
      boostPadGlow,
      vehicles,
      biomes,
      powerups,
      tables,
      trackBgs,
    ] = await Promise.all([
      tryKeyed('/assets/sprites/hazards/robot_vacuum.png', 96, 96),
      tryKeyed('/assets/sprites/hazards/robot_mower.png', 96, 96),
      tryKeyed('/assets/sprites/hazards/drone.png', 96, 96),
      tryKeyed('/assets/sprites/hazards/conveyor.png', 128, 56),
      tryKeyed('/assets/sprites/pickups/powerup_crate.png', 72, 72),
      tryKeyed('/assets/sprites/pickups/powerup_crate_glow.png', 72, 72),
      tryKeyed('/assets/sprites/pickups/token.png', 64, 64),
      tryKeyed('/assets/sprites/pickups/mine.png', 56, 56),
      tryKeyed('/assets/sprites/pickups/boost_pad.png', 128, 64),
      tryKeyed('/assets/sprites/pickups/boost_pad_glow.png', 128, 64),
      loadVehicles(procedural),
      loadBiomes(),
      loadPowerupIcons(procedural),
      loadTablePhotos(),
      loadTrackBackgrounds(),
    ]);

    setTablePhotoTextures(tables);
    setTrackBackgroundTextures(trackBgs);

    // If core race sprites failed entirely, fall back fully.
    if (!vacuum || !pickup || !boostPad) {
      console.warn('[assets] core PNG incomplete, mixing procedural fallbacks');
    }

    return {
      ...procedural,
      vehicles,
      vacuum: vacuum ?? procedural.vacuum,
      mower: mower ?? procedural.mower,
      drone: drone ?? procedural.drone,
      conveyor: conveyor ?? procedural.conveyor,
      pickup: pickup ?? procedural.pickup,
      pickupGlow: pickupGlow ?? procedural.pickupGlow,
      token: token ?? procedural.token,
      mine: mine ?? procedural.mine,
      boostPad: boostPad ?? procedural.boostPad,
      boostPadGlow: boostPadGlow ?? procedural.boostPadGlow,
      biomes,
      powerups,
    };
  } catch (err) {
    console.warn('[assets] PNG load failed, using procedural sprites', err);
    return createSpriteAtlas();
  }
}
