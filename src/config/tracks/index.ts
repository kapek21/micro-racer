import { WORLD_H, WORLD_W } from '../../core/types.js';
import { buildTrack, defaultPickups, figure8Centerline, sampleOnFigure8 } from './builder.js';

/**
 * Lovable v14 boards (1920×1080) share one horizontal ∞ template.
 * Calibrated in art space then mapped into world 1200×800 (anisotropic stretch
 * matches how race-renderer sizes the PNG to the world).
 *
 * Art: cx=960 cy=540  scaleX=620 scaleY=390  ribbon≈145
 */
const CX = WORLD_W / 2;
const CY = WORLD_H / 2;
/** Horizontal half-extent of the lemniscate centerline. */
const SCALE_X = (620 / 1920) * WORLD_W; // ≈ 387.5
/** Vertical scale of the lemniscate (max |y| ≈ scaleY/3). */
const SCALE_Y = (390 / 1080) * WORLD_H; // ≈ 288.9
/** Driveable ribbon width between cyan borders. */
const TRACK_WIDTH = ((145 / 1920) * WORLD_W + (145 / 1080) * WORLD_H) / 2; // ≈ 99

function hazardsForSets(
  _sets: string[],
  _p: (t: number) => { x: number; y: number },
): never[] {
  // Figure-8 Lovable tracks bake scenery into the art; moving hazards on the
  // centerline felt like the old stadium build (vacuums blocking the racing line).
  return [];
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
  unlockedByDefault?: boolean;
  mainGimmick: string;
  hazardSets: string[];
}): ReturnType<typeof buildTrack> {
  const centerline = figure8Centerline(CX, CY, SCALE_X, SCALE_Y, 96);
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
    trackWidth: TRACK_WIDTH,
    centerline,
    boostPads: [
      { x: p(0.12).x - 28, y: p(0.12).y - 14, w: 56, h: 28 },
      { x: p(0.62).x - 28, y: p(0.62).y - 14, w: 56, h: 28 },
    ],
    slipZones: [],
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

export const BATHROOM_8 = figure8Track({
  id: 'bathroom_8',
  name: 'Bathroom Circuit 8',
  namePl: 'Łazienka Ósemka',
  biome: 'bathroom',
  surface: 'wet',
  parTimeMs: 92_000,
  bgColor: 0x101828,
  accentColor: 0x60d0ff,
  unlockedByDefault: true,
  mainGimmick: 'wet_tiles',
  hazardSets: ['suds'],
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
});

export const TRACKS = [KITCHEN_8, BATHROOM_8, GARDEN_8, GARAGE_8, BALCONY_8, DESK_8];

export function trackById(id: string) {
  const t = TRACKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown track: ${id}`);
  return t;
}

export function defaultUnlockedTracks(): string[] {
  return TRACKS.filter((t) => t.unlockedByDefault).map((t) => t.id);
}
