import type { TrackDef, Vec2 } from '../../core/types.js';

export interface TrackBlueprint {
  id: string;
  name: string;
  namePl: string;
  biome: string;
  mainGimmick: string;
  lapCount: number;
  supportsElimination: boolean;
  supportsTimeTrial: boolean;
  hazardSets: string[];
  unlockedByDefault?: boolean;
  trackWidth?: number;
  centerline: Vec2[];
  bgColor: number;
  accentColor: number;
  hazards?: TrackDef['hazards'];
  pickups?: TrackDef['pickups'];
  slipZones?: TrackDef['slipZones'];
  boostPads?: TrackDef['boostPads'];
  checkpoints?: TrackDef['checkpoints'];
  gates?: TrackDef['gates'];
  cameraTraps?: TrackDef['cameraTraps'];
  tokens?: TrackDef['tokens'];
}

function deriveStarts(centerline: Vec2[], trackWidth: number): { positions: Vec2[]; angles: number[] } {
  const a = centerline[0]!;
  const b = centerline[1] ?? centerline[0]!;
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);
  const spacing = trackWidth * 0.22;
  const positions: Vec2[] = [
    { x: a.x - nx * spacing * 1.5, y: a.y - ny * spacing * 1.5 },
    { x: a.x - nx * spacing * 0.5, y: a.y - ny * spacing * 0.5 },
    { x: a.x + nx * spacing * 0.5, y: a.y + ny * spacing * 0.5 },
    { x: a.x + nx * spacing * 1.5, y: a.y + ny * spacing * 1.5 },
  ];
  return { positions, angles: [angle, angle, angle, angle] };
}

export function buildTrack(b: TrackBlueprint): TrackDef {
  const trackWidth = b.trackWidth ?? 110;
  const starts = deriveStarts(b.centerline, trackWidth);
  return {
    id: b.id,
    name: b.name,
    namePl: b.namePl,
    biome: b.biome,
    mainGimmick: b.mainGimmick,
    lapCount: b.lapCount,
    supportsElimination: b.supportsElimination,
    supportsTimeTrial: b.supportsTimeTrial,
    hazardSets: b.hazardSets,
    unlockedByDefault: b.unlockedByDefault ?? false,
    centerline: b.centerline,
    trackWidth,
    startPositions: starts.positions,
    startAngles: starts.angles,
    bgColor: b.bgColor,
    accentColor: b.accentColor,
    hazards: b.hazards ?? [],
    pickups: b.pickups ?? [],
    slipZones: b.slipZones ?? [],
    boostPads: b.boostPads ?? [],
    checkpoints: b.checkpoints ?? [],
    gates: b.gates ?? [],
    cameraTraps: b.cameraTraps ?? [],
    tokens: b.tokens ?? [],
  };
}

/** Common pickup trio for a track. */
export function defaultPickups(
  ids: [string, string, string],
  positions: [Vec2, Vec2, Vec2],
): TrackDef['pickups'] {
  const powerUps = ['turbo_cell', 'shield_bubble', 'smart_grip'] as const;
  return ids.map((id, i) => ({
    id,
    powerUpId: powerUps[i] ?? 'turbo_cell',
    x: positions[i]!.x,
    y: positions[i]!.y,
    respawnMs: 8000 + i * 1000,
  }));
}
