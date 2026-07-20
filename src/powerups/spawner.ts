import type { PickupSpawn, PowerUpRarity, Vec2 } from '../core/types.js';
import { powerUpById } from '../config/powerups.js';

const RARITY_WEIGHT: Record<PowerUpRarity, number> = {
  common: 55,
  rare: 32,
  epic: 13,
};

/** Per-track weighted pools (figure-8 Smart Rush ids). */
const TRACK_POOLS: Record<string, string[]> = {
  kitchen_8: ['turbo_cell', 'shield_bubble', 'smart_grip', 'auto_correct', 'nano_mine', 'magnet_pull'],
  bathroom_8: ['turbo_cell', 'overcharge_boost', 'charge_link', 'smart_grip', 'shield_bubble', 'side_dash'],
  garden_8: ['smart_grip', 'turbo_cell', 'shield_bubble', 'auto_correct', 'paint_foam', 'magnet_pull'],
  garage_8: ['charge_link', 'turbo_cell', 'gate_hack', 'shield_bubble', 'overcharge_boost', 'smart_grip'],
  balcony_8: ['side_dash', 'smart_grip', 'shield_bubble', 'turbo_cell', 'auto_correct', 'camera_cloak'],
  desk_8: ['side_dash', 'turbo_cell', 'magnet_pull', 'nano_mine', 'shield_bubble', 'auto_correct'],
};

function poolForTrack(trackId: string): string[] {
  return TRACK_POOLS[trackId] ?? ['turbo_cell', 'shield_bubble', 'smart_grip', 'side_dash', 'magnet_pull'];
}

function weightedPick(pool: string[], offensiveAllowed: boolean): string {
  const candidates = pool.filter((id) => {
    const def = powerUpById(id);
    if (!offensiveAllowed && def.offensive) return false;
    return true;
  });
  const ids = candidates.length > 0 ? candidates : pool;
  let total = 0;
  const weights = ids.map((id) => {
    const w = RARITY_WEIGHT[powerUpById(id).rarity];
    total += w;
    return w;
  });
  let roll = Math.random() * total;
  for (let i = 0; i < ids.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return ids[i]!;
  }
  return ids[ids.length - 1]!;
}

export function rollTrackPickup(trackId: string, offensiveAllowed = true): string {
  return weightedPick(poolForTrack(trackId), offensiveAllowed);
}

export function trackPickups(
  trackId: string,
  ids: [string, string, string],
  positions: [Vec2, Vec2, Vec2],
  offensiveAllowed = true,
): PickupSpawn[] {
  return ids.map((id, i) => ({
    id,
    powerUpId: rollTrackPickup(trackId, offensiveAllowed),
    x: positions[i]!.x,
    y: positions[i]!.y,
    respawnMs: 8000 + i * 1000,
  }));
}

export function rerollPickupOnRespawn(
  pickup: PickupSpawn,
  trackId: string,
  offensiveAllowed: boolean,
): void {
  pickup.powerUpId = rollTrackPickup(trackId, offensiveAllowed);
}
