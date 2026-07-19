import type { HazardDef, HazardKind } from '../../core/types.js';
import { WORLD_H, WORLD_W } from '../../core/types.js';
import { buildTrack, defaultPickups, figure8Centerline, sampleOnFigure8 } from './builder.js';

const CX = WORLD_W / 2;
const CY = WORLD_H / 2;

const HAZARD_SET_KIND: Record<string, HazardKind> = {
  vacuum: 'robot_vacuum',
  mower: 'robot_mower',
  heat: 'conveyor',
  oil: 'conveyor',
  wind: 'drone_drop',
  clutter: 'drone_drop',
};

function hazardsForSets(
  sets: string[],
  p: (t: number) => { x: number; y: number },
): HazardDef[] {
  const kind = HAZARD_SET_KIND[sets[0] ?? 'vacuum'] ?? 'robot_vacuum';
  const speed = kind === 'drone_drop' ? 160 : kind === 'conveyor' ? 90 : 120;
  const width = kind === 'conveyor' ? 48 : 32;
  return [
    {
      id: 'haz1',
      kind,
      x1: p(0.25).x,
      y1: p(0.25).y,
      x2: p(0.4).x,
      y2: p(0.4).y,
      speed,
      width,
    },
    {
      id: 'haz2',
      kind,
      x1: p(0.7).x,
      y1: p(0.7).y,
      x2: p(0.88).x,
      y2: p(0.88).y,
      speed: speed * 0.85,
      width,
    },
  ];
}

function figure8Track(opts: {
  id: string;
  name: string;
  namePl: string;
  biome: string;
  surface: import('../../core/types.js').SurfaceId;
  parTimeMs: number;
  bgColor: number;
  accentColor: number;
  scaleX?: number;
  scaleY?: number;
  unlockedByDefault?: boolean;
  mainGimmick: string;
  hazardSets: string[];
}): ReturnType<typeof buildTrack> {
  const scaleX = opts.scaleX ?? 380;
  const scaleY = opts.scaleY ?? 280;
  const centerline = figure8Centerline(CX, CY, scaleX, scaleY, 84);
  const p = (t: number) => sampleOnFigure8(centerline, t);
  return buildTrack({
    id: opts.id,
    name: opts.name,
    namePl: opts.namePl,
    biome: opts.biome,
    mainGimmick: opts.mainGimmick,
    lapCount: 3,
    supportsElimination: false,
    supportsTimeTrial: true,
    hazardSets: opts.hazardSets,
    unlockedByDefault: opts.unlockedByDefault ?? false,
    surface: opts.surface,
    parTimeMs: opts.parTimeMs,
    bgColor: opts.bgColor,
    accentColor: opts.accentColor,
    trackWidth: 96,
    centerline,
    boostPads: [
      { x: p(0.12).x - 30, y: p(0.12).y - 16, w: 60, h: 32 },
      { x: p(0.62).x - 30, y: p(0.62).y - 16, w: 60, h: 32 },
    ],
    slipZones: [{ x: p(0.38).x - 50, y: p(0.38).y - 30, w: 100, h: 60 }],
    pickups: defaultPickups(['p1', 'p2', 'p3'], [p(0.2), p(0.45), p(0.78)]),
    tokens: [
      { id: 't1', x: p(0.3).x, y: p(0.3).y },
      { id: 't2', x: p(0.55).x, y: p(0.55).y },
      { id: 't3', x: p(0.85).x, y: p(0.85).y },
    ],
    hazards: hazardsForSets(opts.hazardSets, p),
  });
}

/** 6 figure-8 tracks — one surface each. */
export const KITCHEN_8 = figure8Track({
  id: 'kitchen_8',
  name: 'Kitchen Figure-8',
  namePl: 'Kitchen Ósemka',
  biome: 'kitchen',
  surface: 'carpet',
  parTimeMs: 95_000,
  bgColor: 0x1a2030,
  accentColor: 0x40c0ff,
  unlockedByDefault: true,
  mainGimmick: 'carpet_grip',
  hazardSets: ['vacuum'],
});

export const SOLAR_8 = figure8Track({
  id: 'solar_8',
  name: 'Solar Roof 8',
  namePl: 'Solar Roof Ósemka',
  biome: 'roof',
  surface: 'metal',
  parTimeMs: 92_000,
  bgColor: 0x1a1820,
  accentColor: 0xffc040,
  unlockedByDefault: true,
  mainGimmick: 'hot_panels',
  hazardSets: ['heat'],
  scaleX: 400,
  scaleY: 260,
});

export const GARDEN_8 = figure8Track({
  id: 'garden_8',
  name: 'Garden 8',
  namePl: 'Ogród Ósemka',
  biome: 'garden',
  surface: 'dirt',
  parTimeMs: 100_000,
  bgColor: 0x142018,
  accentColor: 0x60d080,
  unlockedByDefault: true,
  mainGimmick: 'dirt_ruts',
  hazardSets: ['mower'],
});

export const GARAGE_8 = figure8Track({
  id: 'garage_8',
  name: 'Garage 8',
  namePl: 'Garaż Ósemka',
  biome: 'garage',
  surface: 'asphalt',
  parTimeMs: 88_000,
  bgColor: 0x181820,
  accentColor: 0x80a0ff,
  unlockedByDefault: false,
  mainGimmick: 'clean_asphalt',
  hazardSets: ['oil'],
});

export const BALCONY_8 = figure8Track({
  id: 'balcony_8',
  name: 'Balcony Wind 8',
  namePl: 'Balkon Ósemka',
  biome: 'balcony',
  surface: 'wet',
  parTimeMs: 98_000,
  bgColor: 0x101828,
  accentColor: 0x60d0ff,
  unlockedByDefault: false,
  mainGimmick: 'wind_rain',
  hazardSets: ['wind'],
  scaleY: 250,
});

export const DESK_8 = figure8Track({
  id: 'desk_8',
  name: 'Desk Circuit 8',
  namePl: 'Biurko Ósemka',
  biome: 'desk',
  surface: 'gravel',
  parTimeMs: 96_000,
  bgColor: 0x201810,
  accentColor: 0xe0a040,
  unlockedByDefault: false,
  mainGimmick: 'paper_gravel',
  hazardSets: ['clutter'],
  scaleX: 360,
});

export const TRACKS = [KITCHEN_8, SOLAR_8, GARDEN_8, GARAGE_8, BALCONY_8, DESK_8];

export function trackById(id: string) {
  const t = TRACKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown track: ${id}`);
  return t;
}

export function defaultUnlockedTracks(): string[] {
  return TRACKS.filter((t) => t.unlockedByDefault).map((t) => t.id);
}
