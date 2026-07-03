/** Micro Machines-style tabletop surface per biome. */
export interface TableTheme {
  namePl: string;
  /** Playing surface fill (felt, laminate, wood…). */
  surface: number;
  surfaceAlt: number;
  /** Wood / bumper rail around the table. */
  rail: number;
  railHighlight: number;
  railShadow: number;
  /** Lane marking on the track ribbon. */
  laneMark: number;
  /** Chalk / tape center line. */
  lineColor: number;
  /** Warm lamp tint. */
  lampColor: number;
  texture: 'felt' | 'wood' | 'laminate' | 'concrete' | 'tile' | 'grass';
  /** Corner pocket radius (0 = none). */
  pocketRadius: number;
}

export const TABLE_THEMES: Record<string, TableTheme> = {
  kitchen: {
    namePl: 'Blat kuchenny',
    surface: 0xe8e0d4,
    surfaceAlt: 0xd8d0c4,
    rail: 0x6b4423,
    railHighlight: 0x9a6840,
    railShadow: 0x3d2510,
    laneMark: 0xc8c0b4,
    lineColor: 0xffffff,
    lampColor: 0xffe8c0,
    texture: 'laminate',
    pocketRadius: 0,
  },
  roof: {
    namePl: 'Stół ogrodowy',
    surface: 0xc4a574,
    surfaceAlt: 0xb89564,
    rail: 0x5c3a1e,
    railHighlight: 0x8b5a30,
    railShadow: 0x2a1808,
    laneMark: 0xa88858,
    lineColor: 0xfff8e8,
    lampColor: 0xffd890,
    texture: 'wood',
    pocketRadius: 0,
  },
  garden: {
    namePl: 'Trawnik na desce',
    surface: 0x2d7a4a,
    surfaceAlt: 0x256840,
    rail: 0x6b4423,
    railHighlight: 0x9a6840,
    railShadow: 0x3d2510,
    laneMark: 0x358850,
    lineColor: 0xe8ffe8,
    lampColor: 0xfff0c0,
    texture: 'grass',
    pocketRadius: 0,
  },
  garage: {
    namePl: 'Stół warsztatowy',
    surface: 0x707880,
    surfaceAlt: 0x606870,
    rail: 0x404850,
    railHighlight: 0x606870,
    railShadow: 0x202428,
    laneMark: 0x808890,
    lineColor: 0xffffcc,
    lampColor: 0xffe0a0,
    texture: 'concrete',
    pocketRadius: 0,
  },
  security: {
    namePl: 'Biurko securo',
    surface: 0x3a2830,
    surfaceAlt: 0x302028,
    rail: 0x1a1018,
    railHighlight: 0x4a3840,
    railShadow: 0x0a0808,
    laneMark: 0x4a3840,
    lineColor: 0xff8090,
    lampColor: 0xffc0d0,
    texture: 'wood',
    pocketRadius: 0,
  },
  warehouse: {
    namePl: 'Paleta składowa',
    surface: 0xc8a878,
    surfaceAlt: 0xb89868,
    rail: 0x504030,
    railHighlight: 0x786048,
    railShadow: 0x281810,
    laneMark: 0xa88858,
    lineColor: 0xffffff,
    lampColor: 0xffe8b0,
    texture: 'wood',
    pocketRadius: 0,
  },
  living: {
    namePl: 'Stolik kawowy',
    surface: 0x8b6040,
    surfaceAlt: 0x7b5030,
    rail: 0x4a3020,
    railHighlight: 0x7a5840,
    railShadow: 0x2a1810,
    laneMark: 0x9b7050,
    lineColor: 0xffe8d0,
    lampColor: 0xffd0a0,
    texture: 'wood',
    pocketRadius: 0,
  },
  balcony: {
    namePl: 'Stół balkonowy',
    surface: 0xb0b8c0,
    surfaceAlt: 0xa0a8b0,
    rail: 0x505860,
    railHighlight: 0x788088,
    railShadow: 0x303840,
    laneMark: 0xc0c8d0,
    lineColor: 0xffffff,
    lampColor: 0xfff8e8,
    texture: 'tile',
    pocketRadius: 0,
  },
  desk: {
    namePl: 'Biurko',
    surface: 0xd4c4a8,
    surfaceAlt: 0xc4b498,
    rail: 0x6b5030,
    railHighlight: 0x9a7850,
    railShadow: 0x3a2810,
    laneMark: 0xc8b898,
    lineColor: 0x404040,
    lampColor: 0xffffe0,
    texture: 'laminate',
    pocketRadius: 0,
  },
  city: {
    namePl: 'Stół bilardowy',
    surface: 0x1a6b3a,
    surfaceAlt: 0x155830,
    rail: 0x5c2818,
    railHighlight: 0x8b4030,
    railShadow: 0x2a1008,
    laneMark: 0x208848,
    lineColor: 0xffffff,
    lampColor: 0xfff0b0,
    texture: 'felt',
    pocketRadius: 28,
  },
};

export function tableTheme(biome: string): TableTheme {
  return TABLE_THEMES[biome] ?? TABLE_THEMES.city!;
}
