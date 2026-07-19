import { Texture } from 'pixi.js';
import {
  AI_VEHICLE_SPRITE_URLS,
  POWERUP_ICON_URLS,
  TRACK_THUMB_URLS,
  VEHICLE_SPRITE_URLS,
} from '../config/asset-paths.js';
import { POWERUPS } from '../config/powerups.js';
import { createSpriteAtlas, type SpriteAtlas } from './sprite-atlas.js';
import { setTrackBackgroundTextures } from './track-background.js';

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

async function tryKeyed(url: string, w: number, h = w): Promise<Texture | null> {
  try {
    return await loadKeyedTexture(url, w, h);
  } catch {
    return null;
  }
}

/** Lovable figure-8 boards — primary race backdrop. */
async function loadTrackBackgrounds(): Promise<Record<string, Texture>> {
  const out: Record<string, Texture> = {};
  await Promise.all(
    Object.entries(TRACK_THUMB_URLS).map(async ([id, url]) => {
      try {
        const img = await loadImage(url);
        out[id] = Texture.from(img);
      } catch {
        console.warn(`[assets] Lovable track missing: ${id}`);
      }
    }),
  );
  return out;
}

async function loadVehicles(procedural: SpriteAtlas): Promise<Record<string, Texture>> {
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

async function loadPowerupIcons(procedural: SpriteAtlas): Promise<Record<string, Texture>> {
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

/**
 * Load only what the race needs right now:
 * Lovable track boards + vehicles + pickups/power-ups.
 * Biomes / table photos / VFX / hazard PNGs are deferred.
 */
export async function loadSpriteAtlas(): Promise<SpriteAtlas> {
  try {
    const procedural = createSpriteAtlas();
    const [pickup, pickupGlow, token, mine, boostPad, boostPadGlow, vehicles, powerups, trackBgs] =
      await Promise.all([
        tryKeyed('/assets/sprites/pickups/powerup_crate.png', 72, 72),
        tryKeyed('/assets/sprites/pickups/powerup_crate_glow.png', 72, 72),
        tryKeyed('/assets/sprites/pickups/token.png', 64, 64),
        tryKeyed('/assets/sprites/pickups/mine.png', 56, 56),
        tryKeyed('/assets/sprites/pickups/boost_pad.png', 128, 64),
        tryKeyed('/assets/sprites/pickups/boost_pad_glow.png', 128, 64),
        loadVehicles(procedural),
        loadPowerupIcons(procedural),
        loadTrackBackgrounds(),
      ]);

    setTrackBackgroundTextures(trackBgs);

    if (Object.keys(trackBgs).length === 0) {
      console.warn('[assets] no Lovable track boards loaded');
    }

    return {
      ...procedural,
      vehicles,
      pickup: pickup ?? procedural.pickup,
      pickupGlow: pickupGlow ?? procedural.pickupGlow,
      token: token ?? procedural.token,
      mine: mine ?? procedural.mine,
      boostPad: boostPad ?? procedural.boostPad,
      boostPadGlow: boostPadGlow ?? procedural.boostPadGlow,
      biomes: {},
      powerups,
    };
  } catch (err) {
    console.warn('[assets] PNG load failed, using procedural sprites', err);
    return createSpriteAtlas();
  }
}
