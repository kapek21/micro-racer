import { Texture } from 'pixi.js';
import { BIOME_SPRITE_URLS } from '../config/asset-paths.js';
import { VEHICLES } from '../config/vehicles.js';
import { createSpriteAtlas, type SpriteAtlas } from './sprite-atlas.js';

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
  chromaKey(imageData);
  ctx.putImageData(imageData, 0, 0);
  return Texture.from(canvas);
}

const ASSET = {
  vehicles: {
    volt_mini_gt: '/assets/sprites/vehicles/volt_mini_gt.png',
    sweep_x_buggy: '/assets/sprites/vehicles/sweep_x_buggy.png',
    charge_van: '/assets/sprites/vehicles/charge_van.png',
    photon_racer: '/assets/sprites/vehicles/photon_racer.png',
  },
  vacuum: '/assets/sprites/hazards/robot_vacuum.png',
  mower: '/assets/sprites/hazards/robot_mower.png',
  drone: '/assets/sprites/hazards/drone.png',
  conveyor: '/assets/sprites/hazards/conveyor.png',
  pickup: '/assets/sprites/pickups/powerup_crate.png',
  pickupGlow: '/assets/sprites/pickups/powerup_crate_glow.png',
  token: '/assets/sprites/pickups/token.png',
  mine: '/assets/sprites/pickups/mine.png',
  boostPad: '/assets/sprites/pickups/boost_pad.png',
  boostPadGlow: '/assets/sprites/pickups/boost_pad_glow.png',
} as const;

async function loadBiomes(): Promise<Record<string, Texture>> {
  const biomes: Record<string, Texture> = {};
  await Promise.all(
    Object.entries(BIOME_SPRITE_URLS).map(async ([key, url]) => {
      try {
        biomes[key] = await loadKeyedTexture(url, 160, 160);
      } catch {
        console.warn(`[assets] biome sprite missing: ${key}`);
      }
    }),
  );
  return biomes;
}

export async function loadSpriteAtlas(): Promise<SpriteAtlas> {
  try {
    const [
      volt,
      sweep,
      charge,
      photon,
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
    ] = await Promise.all([
      loadKeyedTexture(ASSET.vehicles.volt_mini_gt, 128, 128),
      loadKeyedTexture(ASSET.vehicles.sweep_x_buggy, 128, 128),
      loadKeyedTexture(ASSET.vehicles.charge_van, 128, 128),
      loadKeyedTexture(ASSET.vehicles.photon_racer, 128, 128),
      loadKeyedTexture(ASSET.vacuum, 96, 96),
      loadKeyedTexture(ASSET.mower, 96, 96),
      loadKeyedTexture(ASSET.drone, 96, 96),
      loadKeyedTexture(ASSET.conveyor, 128, 56),
      loadKeyedTexture(ASSET.pickup, 72, 72),
      loadKeyedTexture(ASSET.pickupGlow, 72, 72),
      loadKeyedTexture(ASSET.token, 64, 64),
      loadKeyedTexture(ASSET.mine, 56, 56),
      loadKeyedTexture(ASSET.boostPad, 128, 64),
      loadKeyedTexture(ASSET.boostPadGlow, 128, 64),
    ]);

    const procedural = createSpriteAtlas();
    const vehicles: Record<string, Texture> = {};
    for (const v of VEHICLES) {
      vehicles[v.id] =
        v.id === 'volt_mini_gt'
          ? volt
          : v.id === 'sweep_x_buggy'
            ? sweep
            : v.id === 'charge_van'
              ? charge
              : v.id === 'photon_racer'
                ? photon
                : procedural.vehicles[v.id]!;
    }

    const biomes = { ...procedural.biomes, ...(await loadBiomes()) };

    return {
      ...procedural,
      vehicles,
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
      biomes,
    };
  } catch (err) {
    console.warn('[assets] PNG load failed, using procedural sprites', err);
    return createSpriteAtlas();
  }
}
