import { Texture } from 'pixi.js';

const cache = new Map<string, Texture>();

/** Lovable track art used as race backdrop (by track id, e.g. kitchen_8). */
export function setTrackBackgroundTextures(textures: Record<string, Texture>): void {
  cache.clear();
  for (const [id, tex] of Object.entries(textures)) {
    cache.set(id, tex);
  }
}

export function trackBackgroundTexture(trackId: string): Texture | null {
  return cache.get(trackId) ?? null;
}

export function hasTrackBackgrounds(): boolean {
  return cache.size > 0;
}
