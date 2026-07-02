export type BiomeAnim = 'pulse' | 'bob' | 'flicker' | 'rotate';

export interface BiomePropDef {
  key: string;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  anim?: BiomeAnim;
}

export const BIOME_PROPS: Record<string, BiomePropDef[]> = {
  kitchen: [
    { key: 'kitchen_island', x: 480, y: 350, scale: 1.15 },
    { key: 'kitchen_fridge', x: 1020, y: 160, scale: 0.9, anim: 'pulse' },
    { key: 'kitchen_island', x: 220, y: 650, scale: 0.75, rotation: 0.4 },
  ],
  roof: [
    { key: 'roof_solar', x: 280, y: 280, scale: 0.95 },
    { key: 'roof_solar', x: 480, y: 280, scale: 0.95 },
    { key: 'roof_solar', x: 680, y: 280, scale: 0.95 },
    { key: 'roof_ac', x: 900, y: 310, scale: 0.85, anim: 'bob' },
    { key: 'roof_ac', x: 1100, y: 290, scale: 0.85, anim: 'bob' },
  ],
  garden: [
    { key: 'garden_tree', x: 580, y: 380, scale: 1.25 },
    { key: 'garden_lawn', x: 950, y: 500, scale: 0.95 },
    { key: 'garden_tree', x: 200, y: 550, scale: 0.9, rotation: 0.2 },
    { key: 'garden_lawn', x: 1050, y: 680, scale: 0.8 },
  ],
  garage: [
    { key: 'garage_bench', x: 500, y: 320, scale: 1.1 },
    { key: 'garage_charger', x: 880, y: 420, scale: 0.95, anim: 'pulse' },
    { key: 'garage_charger', x: 240, y: 600, scale: 0.85, anim: 'pulse' },
  ],
  security: [
    { key: 'security_camera', x: 140, y: 140, scale: 0.9, anim: 'rotate' },
    { key: 'security_camera', x: 1060, y: 140, scale: 0.9, anim: 'rotate' },
    { key: 'security_laser', x: 600, y: 680, scale: 1.2, anim: 'flicker' },
    { key: 'security_laser', x: 300, y: 680, scale: 1.0, anim: 'flicker' },
  ],
  warehouse: [
    { key: 'warehouse_shelf', x: 250, y: 300, scale: 1.05 },
    { key: 'warehouse_shelf', x: 900, y: 300, scale: 1.05 },
    { key: 'warehouse_pallet', x: 580, y: 620, scale: 0.95 },
    { key: 'warehouse_pallet', x: 180, y: 520, scale: 0.85, rotation: 0.5 },
  ],
  living: [
    { key: 'living_tv', x: 580, y: 360, scale: 1.15, anim: 'pulse' },
    { key: 'living_sofa', x: 380, y: 520, scale: 1.0 },
    { key: 'living_sofa', x: 820, y: 480, scale: 0.85, rotation: Math.PI },
  ],
  balcony: [
    { key: 'balcony_planter', x: 450, y: 350, scale: 1.1 },
    { key: 'balcony_sensor', x: 1000, y: 280, scale: 0.85, anim: 'bob' },
    { key: 'balcony_planter', x: 720, y: 600, scale: 0.8, rotation: -0.3 },
  ],
  desk: [
    { key: 'desk_setup', x: 560, y: 380, scale: 1.1 },
    { key: 'desk_lamp', x: 920, y: 250, scale: 0.85, anim: 'pulse' },
    { key: 'desk_lamp', x: 240, y: 580, scale: 0.75 },
  ],
  city: [
    { key: 'city_towers', x: 200, y: 420, scale: 0.85 },
    { key: 'city_towers', x: 380, y: 400, scale: 0.95 },
    { key: 'city_towers', x: 560, y: 380, scale: 1.05 },
    { key: 'city_towers', x: 740, y: 400, scale: 0.9 },
    { key: 'city_lamp', x: 920, y: 480, scale: 0.8, anim: 'pulse' },
    { key: 'city_lamp', x: 1080, y: 500, scale: 0.75, anim: 'pulse' },
  ],
};
