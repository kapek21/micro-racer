import type { PowerUpRarity } from '../core/types.js';

export interface PowerUpVisual {
  color: number;
  glow: number;
  ring: number;
  symbol: string;
  rarity: PowerUpRarity;
}

export const POWERUP_VISUALS: Record<string, PowerUpVisual> = {
  turbo_cell: { color: 0x20d0ff, glow: 0x60f0ff, ring: 0x1080a0, symbol: '⚡', rarity: 'common' },
  overcharge_boost: { color: 0xff4060, glow: 0xff8090, ring: 0x901030, symbol: '🔥', rarity: 'rare' },
  side_dash: { color: 0x40ff90, glow: 0x80ffc0, ring: 0x208040, symbol: '↔', rarity: 'common' },
  smart_grip: { color: 0xffd040, glow: 0xffe880, ring: 0x906010, symbol: '◎', rarity: 'common' },
  emp_pulse: { color: 0x6080ff, glow: 0xa0c0ff, ring: 0x3040a0, symbol: '◉', rarity: 'rare' },
  nano_mine: { color: 0xff3030, glow: 0xff6060, ring: 0x801010, symbol: '✦', rarity: 'common' },
  drone_zap: { color: 0xc060ff, glow: 0xe0a0ff, ring: 0x6020a0, symbol: '⌁', rarity: 'rare' },
  paint_foam: { color: 0xffffff, glow: 0xe0f0ff, ring: 0x8090a0, symbol: '☁', rarity: 'common' },
  shield_bubble: { color: 0x40e0ff, glow: 0x80f0ff, ring: 0x2080a0, symbol: '⛨', rarity: 'common' },
  auto_correct: { color: 0x60ffa0, glow: 0xa0ffc0, ring: 0x208040, symbol: '↻', rarity: 'common' },
  jam_blocker: { color: 0x40ff60, glow: 0x80ff90, ring: 0x108030, symbol: '▣', rarity: 'rare' },
  camera_cloak: { color: 0xa040ff, glow: 0xd080ff, ring: 0x6020a0, symbol: '◌', rarity: 'rare' },
  gate_hack: { color: 0xff40ff, glow: 0xff80ff, ring: 0x9020a0, symbol: '⌗', rarity: 'epic' },
  charge_link: { color: 0xffa030, glow: 0xffc060, ring: 0x904010, symbol: '⛊', rarity: 'common' },
  magnet_pull: { color: 0xff60c0, glow: 0xffa0e0, ring: 0xa02060, symbol: '◎', rarity: 'common' },
};

export function powerUpVisual(id: string): PowerUpVisual {
  return (
    POWERUP_VISUALS[id] ?? {
      color: 0xff80c0,
      glow: 0xffc0e0,
      ring: 0x802060,
      symbol: '?',
      rarity: 'common',
    }
  );
}

export function rarityPulse(rarity: PowerUpRarity, t: number): number {
  const speed = rarity === 'epic' ? 0.012 : rarity === 'rare' ? 0.008 : 0.005;
  return 0.85 + 0.15 * Math.sin(t * speed);
}

export function rarityGlowScale(rarity: PowerUpRarity): number {
  switch (rarity) {
    case 'epic':
      return 1.65;
    case 'rare':
      return 1.45;
    default:
      return 1.25;
  }
}
