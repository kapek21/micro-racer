import type { SurfaceId, VehicleClass, VehicleConfig } from '../core/types.js';
import { registerVehicle } from './vehicles.js';

export type { SurfaceId };
export type PartSlot = 'wheels' | 'body' | 'engine';

export interface PartDef {
  id: string;
  slot: PartSlot;
  namePl: string;
  preferredSurface: SurfaceId;
  /** Contribution toward composed vehicle (weights applied in compose). */
  acceleration: number;
  topSpeed: number;
  traction: number;
  turnRate: number;
  boostEfficiency: number;
  collisionResistance: number;
  recoverySpeed: number;
  color?: number;
  accent?: number;
  vehicleClass?: VehicleClass;
}

export interface SkillScores {
  wheels: number;
  body: number;
  engine: number;
}

export interface ComposedBuild {
  vehicle: VehicleConfig;
  wheelsId: string;
  bodyId: string;
  engineId: string;
  skill: SkillScores;
  surface: SurfaceId;
  buildPoints: number;
  surfaceMatch: number;
}

export const SURFACE_LABELS: Record<SurfaceId, string> = {
  asphalt: 'Asfalt',
  gravel: 'Żwir',
  wet: 'Mokro',
  carpet: 'Dywan',
  metal: 'Metal',
  dirt: 'Ziemia',
};

export const PARTS: PartDef[] = [
  // Wheels — one flavor per surface (6)
  {
    id: 'wheels_slick',
    slot: 'wheels',
    namePl: 'Slick Street',
    preferredSurface: 'asphalt',
    acceleration: 40,
    topSpeed: 30,
    traction: 0.34,
    turnRate: 1.1,
    boostEfficiency: 0.05,
    collisionResistance: 0.2,
    recoverySpeed: 0.05,
  },
  {
    id: 'wheels_knobby',
    slot: 'wheels',
    namePl: 'Knobby Trail',
    preferredSurface: 'dirt',
    acceleration: 25,
    topSpeed: 10,
    traction: 0.42,
    turnRate: 1.35,
    boostEfficiency: 0,
    collisionResistance: 0.25,
    recoverySpeed: 0.1,
  },
  {
    id: 'wheels_rain',
    slot: 'wheels',
    namePl: 'Rain Groove',
    preferredSurface: 'wet',
    acceleration: 20,
    topSpeed: 15,
    traction: 0.48,
    turnRate: 1.2,
    boostEfficiency: 0,
    collisionResistance: 0.15,
    recoverySpeed: 0.15,
  },
  {
    id: 'wheels_gravel',
    slot: 'wheels',
    namePl: 'Gravel Bite',
    preferredSurface: 'gravel',
    acceleration: 28,
    topSpeed: 18,
    traction: 0.4,
    turnRate: 1.25,
    boostEfficiency: 0,
    collisionResistance: 0.28,
    recoverySpeed: 0.12,
  },
  {
    id: 'wheels_carpet',
    slot: 'wheels',
    namePl: 'Carpet Soft',
    preferredSurface: 'carpet',
    acceleration: 32,
    topSpeed: 22,
    traction: 0.38,
    turnRate: 1.4,
    boostEfficiency: 0.02,
    collisionResistance: 0.18,
    recoverySpeed: 0.14,
  },
  {
    id: 'wheels_metal',
    slot: 'wheels',
    namePl: 'Metal Grip',
    preferredSurface: 'metal',
    acceleration: 35,
    topSpeed: 28,
    traction: 0.36,
    turnRate: 1.15,
    boostEfficiency: 0.08,
    collisionResistance: 0.22,
    recoverySpeed: 0.08,
  },
  // Body — one flavor per surface (6)
  {
    id: 'body_aero',
    slot: 'body',
    namePl: 'Aero Shell',
    preferredSurface: 'metal',
    acceleration: 15,
    topSpeed: 55,
    traction: 0.08,
    turnRate: 0.9,
    boostEfficiency: 0.15,
    collisionResistance: 0.25,
    recoverySpeed: 0.05,
    color: 0xff4080,
    accent: 0x901040,
    vehicleClass: 'speed',
  },
  {
    id: 'body_compact',
    slot: 'body',
    namePl: 'Compact Cabin',
    preferredSurface: 'carpet',
    acceleration: 35,
    topSpeed: 25,
    traction: 0.18,
    turnRate: 1.5,
    boostEfficiency: 0.05,
    collisionResistance: 0.35,
    recoverySpeed: 0.2,
    color: 0x20c8e8,
    accent: 0x0a6080,
    vehicleClass: 'balanced',
  },
  {
    id: 'body_tank',
    slot: 'body',
    namePl: 'Tank Frame',
    preferredSurface: 'gravel',
    acceleration: 10,
    topSpeed: 20,
    traction: 0.22,
    turnRate: 0.75,
    boostEfficiency: 0,
    collisionResistance: 0.7,
    recoverySpeed: 0.1,
    color: 0xffa030,
    accent: 0x904010,
    vehicleClass: 'heavy',
  },
  {
    id: 'body_street',
    slot: 'body',
    namePl: 'Street GT',
    preferredSurface: 'asphalt',
    acceleration: 22,
    topSpeed: 48,
    traction: 0.12,
    turnRate: 1.05,
    boostEfficiency: 0.12,
    collisionResistance: 0.3,
    recoverySpeed: 0.08,
    color: 0x40e878,
    accent: 0x188840,
    vehicleClass: 'speed',
  },
  {
    id: 'body_aqua',
    slot: 'body',
    namePl: 'Aqua Seal',
    preferredSurface: 'wet',
    acceleration: 18,
    topSpeed: 35,
    traction: 0.2,
    turnRate: 1.2,
    boostEfficiency: 0.08,
    collisionResistance: 0.4,
    recoverySpeed: 0.16,
    color: 0x40a0ff,
    accent: 0x104080,
    vehicleClass: 'agile',
  },
  {
    id: 'body_trail',
    slot: 'body',
    namePl: 'Trail Buggy',
    preferredSurface: 'dirt',
    acceleration: 20,
    topSpeed: 30,
    traction: 0.24,
    turnRate: 1.1,
    boostEfficiency: 0.04,
    collisionResistance: 0.5,
    recoverySpeed: 0.14,
    color: 0xc8a040,
    accent: 0x685010,
    vehicleClass: 'balanced',
  },
  // Engine — one flavor per surface (6)
  {
    id: 'engine_volt',
    slot: 'engine',
    namePl: 'Volt Core',
    preferredSurface: 'asphalt',
    acceleration: 90,
    topSpeed: 70,
    traction: 0.05,
    turnRate: 0.3,
    boostEfficiency: 0.35,
    collisionResistance: 0.1,
    recoverySpeed: 0.15,
  },
  {
    id: 'engine_torque',
    slot: 'engine',
    namePl: 'Torque Pump',
    preferredSurface: 'dirt',
    acceleration: 110,
    topSpeed: 40,
    traction: 0.12,
    turnRate: 0.45,
    boostEfficiency: 0.15,
    collisionResistance: 0.2,
    recoverySpeed: 0.25,
  },
  {
    id: 'engine_pulse',
    slot: 'engine',
    namePl: 'Pulse Turbine',
    preferredSurface: 'wet',
    acceleration: 75,
    topSpeed: 85,
    traction: 0.02,
    turnRate: 0.25,
    boostEfficiency: 0.45,
    collisionResistance: 0.05,
    recoverySpeed: 0.1,
  },
  {
    id: 'engine_grit',
    slot: 'engine',
    namePl: 'Grit Crusher',
    preferredSurface: 'gravel',
    acceleration: 100,
    topSpeed: 50,
    traction: 0.1,
    turnRate: 0.35,
    boostEfficiency: 0.12,
    collisionResistance: 0.25,
    recoverySpeed: 0.2,
  },
  {
    id: 'engine_loom',
    slot: 'engine',
    namePl: 'Loom Drive',
    preferredSurface: 'carpet',
    acceleration: 85,
    topSpeed: 55,
    traction: 0.08,
    turnRate: 0.4,
    boostEfficiency: 0.2,
    collisionResistance: 0.15,
    recoverySpeed: 0.18,
  },
  {
    id: 'engine_flux',
    slot: 'engine',
    namePl: 'Flux Coil',
    preferredSurface: 'metal',
    acceleration: 95,
    topSpeed: 80,
    traction: 0.04,
    turnRate: 0.28,
    boostEfficiency: 0.4,
    collisionResistance: 0.08,
    recoverySpeed: 0.12,
  },
];

export function partsForSlot(slot: PartSlot): PartDef[] {
  return PARTS.filter((p) => p.slot === slot);
}

export function partById(id: string): PartDef {
  const p = PARTS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown part: ${id}`);
  return p;
}

/** Ideal part for a surface in a slot (first matching preferred). */
export function idealPartForSurface(slot: PartSlot, surface: SurfaceId): PartDef {
  const match = partsForSlot(slot).find((p) => p.preferredSurface === surface);
  return match ?? partsForSlot(slot)[0]!;
}

/**
 * Green zone half-width on −1…+1 skill bar.
 * Same width for every part — UI must not tip which part is “best” for the surface.
 */
export function greenZoneHalfWidth(_part: PartDef, _surface: SurfaceId): number {
  return 0.15;
}

/** Quality 0…1 from skill click (−1…+1) relative to green center (0). */
export function skillQuality(skill: number, halfWidth: number): number {
  const abs = Math.abs(skill);
  if (abs <= 0.08) return 1;
  if (abs >= halfWidth) return Math.max(0, 1 - (abs - halfWidth) / (1 - halfWidth + 0.001));
  return 0.55 + 0.45 * (1 - abs / halfWidth);
}

function surfaceAffinity(part: PartDef, surface: SurfaceId): number {
  if (part.preferredSurface === surface) return 1.12;
  // Adjacent soft matches
  const soft: Record<SurfaceId, SurfaceId[]> = {
    asphalt: ['metal', 'gravel'],
    gravel: ['dirt', 'asphalt'],
    wet: ['asphalt', 'metal'],
    carpet: ['asphalt'],
    metal: ['asphalt', 'wet'],
    dirt: ['gravel'],
  };
  if (soft[surface]?.includes(part.preferredSurface)) return 0.92;
  return 0.78;
}

export function computeBuildPoints(
  wheels: PartDef,
  body: PartDef,
  engine: PartDef,
  surface: SurfaceId,
  skill: SkillScores,
): { buildPoints: number; surfaceMatch: number } {
  const slots: Array<{ part: PartDef; s: number }> = [
    { part: wheels, s: skill.wheels },
    { part: body, s: skill.body },
    { part: engine, s: skill.engine },
  ];
  let total = 0;
  let matchSum = 0;
  for (const { part, s } of slots) {
    const half = greenZoneHalfWidth(part, surface);
    const q = skillQuality(s, half);
    const aff = surfaceAffinity(part, surface);
    matchSum += aff;
    total += Math.round(100 * q * aff);
  }
  return { buildPoints: Math.min(300, total), surfaceMatch: matchSum / 3 };
}

export function composeVehicle(
  wheelsId: string,
  bodyId: string,
  engineId: string,
  surface: SurfaceId,
  skill: SkillScores,
  vehicleId = 'player_build',
): ComposedBuild {
  const wheels = partById(wheelsId);
  const body = partById(bodyId);
  const engine = partById(engineId);
  const { buildPoints, surfaceMatch } = computeBuildPoints(wheels, body, engine, surface, skill);

  const qualities = {
    wheels: skillQuality(skill.wheels, greenZoneHalfWidth(wheels, surface)),
    body: skillQuality(skill.body, greenZoneHalfWidth(body, surface)),
    engine: skillQuality(skill.engine, greenZoneHalfWidth(engine, surface)),
  };
  const avgQ = (qualities.wheels + qualities.body + qualities.engine) / 3;
  const skillMul = 0.72 + 0.38 * avgQ;
  const affMul = 0.85 + 0.2 * (surfaceMatch - 0.78) / (1.12 - 0.78);

  const mul = skillMul * affMul;
  const vehicle: VehicleConfig = {
    id: vehicleId,
    name: 'Custom Build',
    namePl: 'Custom Build',
    class: body.vehicleClass ?? 'balanced',
    color: body.color ?? 0x40e878,
    accent: body.accent ?? 0x188840,
    acceleration: (wheels.acceleration + body.acceleration + engine.acceleration) * mul,
    topSpeed: (220 + wheels.topSpeed + body.topSpeed + engine.topSpeed) * mul,
    traction: Math.min(
      1.05,
      (wheels.traction + body.traction + engine.traction) * (0.9 + 0.15 * surfaceMatch),
    ),
    turnRate:
      (1.6 + wheels.turnRate + body.turnRate + engine.turnRate) * (0.85 + 0.2 * qualities.wheels),
    collisionResistance: Math.min(
      1.4,
      wheels.collisionResistance + body.collisionResistance + engine.collisionResistance,
    ),
    boostEfficiency: Math.min(
      1.4,
      0.7 + wheels.boostEfficiency + body.boostEfficiency + engine.boostEfficiency,
    ) * (0.85 + 0.2 * qualities.engine),
    recoverySpeed: Math.min(
      1.3,
      0.7 + wheels.recoverySpeed + body.recoverySpeed + engine.recoverySpeed,
    ),
  };

  registerVehicle(vehicle);

  return {
    vehicle,
    wheelsId,
    bodyId,
    engineId,
    skill,
    surface,
    buildPoints,
    surfaceMatch,
  };
}

/** Balanced AI cars — registered once. */
export function ensureAiVehicles(): VehicleConfig[] {
  const defs: VehicleConfig[] = [
    {
      id: 'ai_balanced',
      name: 'AI Balanced',
      namePl: 'AI Balanced',
      class: 'balanced',
      color: 0x8899aa,
      accent: 0x445566,
      acceleration: 480,
      topSpeed: 400,
      traction: 0.9,
      turnRate: 3.6,
      collisionResistance: 0.9,
      boostEfficiency: 1,
      recoverySpeed: 1,
    },
    {
      id: 'ai_agile',
      name: 'AI Agile',
      namePl: 'AI Agile',
      class: 'agile',
      color: 0x66cc88,
      accent: 0x228844,
      acceleration: 460,
      topSpeed: 385,
      traction: 0.96,
      turnRate: 4.2,
      collisionResistance: 0.7,
      boostEfficiency: 0.95,
      recoverySpeed: 1.1,
    },
    {
      id: 'ai_speed',
      name: 'AI Speed',
      namePl: 'AI Speed',
      class: 'speed',
      color: 0xcc6688,
      accent: 0x882244,
      acceleration: 490,
      topSpeed: 430,
      traction: 0.82,
      turnRate: 3.4,
      collisionResistance: 0.75,
      boostEfficiency: 1.15,
      recoverySpeed: 0.95,
    },
  ];
  for (const v of defs) registerVehicle(v);
  return defs;
}

/** Auto-pick ideal parts + perfect skill for testing / fallback. */
export function autoIdealBuild(surface: SurfaceId): ComposedBuild {
  const wheels = idealPartForSurface('wheels', surface);
  const body = idealPartForSurface('body', surface);
  const engine = idealPartForSurface('engine', surface);
  // Fallback when surface has no dedicated part: still pick first of slot
  return composeVehicle(wheels.id, body.id, engine.id, surface, {
    wheels: 0,
    body: 0,
    engine: 0,
  });
}
