import type { PowerUpConfig } from '../core/types.js';

export const POWERUPS: PowerUpConfig[] = [
  { id: 'turbo_cell', namePl: 'Turbo Cell', category: 'mobility', rarity: 'common', durationMs: 2200 },
  { id: 'overcharge_boost', namePl: 'Overcharge Boost', category: 'mobility', rarity: 'rare', durationMs: 2800 },
  { id: 'side_dash', namePl: 'Side Dash', category: 'mobility', rarity: 'common', charges: 2 },
  { id: 'smart_grip', namePl: 'Smart Grip', category: 'mobility', rarity: 'common', durationMs: 3500 },
  { id: 'emp_pulse', namePl: 'EMP Pulse', category: 'offense', rarity: 'rare', durationMs: 1800, offensive: true },
  { id: 'nano_mine', namePl: 'Nano Mine', category: 'offense', rarity: 'common', charges: 2, offensive: true },
  { id: 'drone_zap', namePl: 'Drone Zap', category: 'offense', rarity: 'rare', durationMs: 2500, offensive: true },
  { id: 'paint_foam', namePl: 'Paint Foam', category: 'offense', rarity: 'common', durationMs: 4000, offensive: true },
  { id: 'shield_bubble', namePl: 'Shield Bubble', category: 'defense', rarity: 'common', durationMs: 4000 },
  { id: 'auto_correct', namePl: 'Auto Correct', category: 'defense', rarity: 'common', durationMs: 5000 },
  { id: 'jam_blocker', namePl: 'Jam Blocker', category: 'defense', rarity: 'rare', durationMs: 6000 },
  { id: 'camera_cloak', namePl: 'Camera Cloak', category: 'utility', rarity: 'rare', durationMs: 4500 },
  { id: 'gate_hack', namePl: 'Gate Hack', category: 'utility', rarity: 'epic', durationMs: 5000 },
  { id: 'charge_link', namePl: 'Charge Link', category: 'utility', rarity: 'common', durationMs: 6000 },
  { id: 'magnet_pull', namePl: 'Magnet Pull', category: 'utility', rarity: 'common', durationMs: 3500 },
];

export function powerUpById(id: string): PowerUpConfig {
  const p = POWERUPS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown power-up: ${id}`);
  return p;
}

export function isOffensivePowerUp(id: string): boolean {
  return powerUpById(id).offensive === true;
}
