import { buildTrack } from './builder.js';
import { trackPickups } from '../../powerups/spawner.js';

/** Track 1 — onboarding smart kitchen loop. */
export const SMART_KITCHEN = buildTrack({
  id: 'smart_kitchen',
  name: 'Smart Kitchen Circuit',
  namePl: 'Smart Kitchen Circuit',
  biome: 'kitchen',
  mainGimmick: 'robot_vacuum_slip',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['vacuum', 'slip'],
  unlockedByDefault: true,
  bgColor: 0x1a2030,
  accentColor: 0x40c0ff,
  centerline: [
    { x: 600, y: 140 },
    { x: 880, y: 140 },
    { x: 1020, y: 220 },
    { x: 1040, y: 420 },
    { x: 960, y: 620 },
    { x: 720, y: 680 },
    { x: 480, y: 680 },
    { x: 240, y: 620 },
    { x: 160, y: 420 },
    { x: 180, y: 220 },
    { x: 320, y: 140 },
    { x: 600, y: 140 },
  ],
  hazards: [
    { id: 'vac_main', kind: 'robot_vacuum', x1: 420, y1: 400, x2: 780, y2: 400, speed: 140, width: 36 },
  ],
  slipZones: [{ x: 500, y: 360, w: 200, h: 80 }],
  gates: [{ id: 'kitchen_short', x: 720, y: 380, w: 20, h: 60, shortcut: true, defaultOpen: false }],
  boostPads: [
    { x: 900, y: 520, w: 80, h: 40 },
    { x: 220, y: 520, w: 80, h: 40 },
  ],
  pickups: trackPickups(
    'smart_kitchen',
    ['p1', 'p2', 'p3'],
    [
      { x: 600, y: 300 },
      { x: 350, y: 500 },
      { x: 850, y: 250 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.25, x: 1020, y: 220, deadlineMs: 12000 },
    { id: 'cp2', progress: 0.5, x: 480, y: 680, deadlineMs: 28000 },
    { id: 'cp3', progress: 0.75, x: 160, y: 420, deadlineMs: 44000 },
  ],
  tokens: [
    { id: 't1', x: 720, y: 400 },
    { id: 't2', x: 400, y: 250 },
    { id: 't3', x: 800, y: 600 },
  ],
});

export const SOLAR_ROOF = buildTrack({
  id: 'solar_roof',
  name: 'Solar Roof Sprint',
  namePl: 'Solar Roof Sprint',
  biome: 'roof',
  mainGimmick: 'hot_panels_boost',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['heat', 'edge'],
  unlockedByDefault: true,
  bgColor: 0x1a1820,
  accentColor: 0xffc040,
  trackWidth: 100,
  centerline: [
    { x: 600, y: 100 },
    { x: 980, y: 120 },
    { x: 1100, y: 280 },
    { x: 1080, y: 520 },
    { x: 900, y: 680 },
    { x: 600, y: 720 },
    { x: 300, y: 680 },
    { x: 120, y: 520 },
    { x: 100, y: 280 },
    { x: 220, y: 120 },
    { x: 600, y: 100 },
  ],
  slipZones: [
    { x: 850, y: 300, w: 120, h: 80 },
    { x: 230, y: 300, w: 120, h: 80 },
  ],
  boostPads: [
    { x: 560, y: 640, w: 80, h: 40 },
    { x: 560, y: 160, w: 80, h: 40 },
  ],
  hazards: [
    { id: 'mower_edge', kind: 'robot_mower', x1: 300, y1: 650, x2: 900, y2: 650, speed: 100, width: 30 },
  ],
  pickups: trackPickups(
    'solar_roof',
    ['p1', 'p2', 'p3'],
    [
      { x: 600, y: 400 },
      { x: 200, y: 500 },
      { x: 1000, y: 500 },
    ],
  ),
  heatZones: [
    { x: 850, y: 300, w: 120, h: 80, gripMult: 0.65, boostOnExit: true },
    { x: 230, y: 300, w: 120, h: 80, gripMult: 0.65, boostOnExit: true },
  ],
  checkpoints: [
    { id: 'cp1', progress: 0.2, x: 1100, y: 280, deadlineMs: 10000 },
    { id: 'cp2', progress: 0.55, x: 300, y: 680, deadlineMs: 24000 },
    { id: 'cp3', progress: 0.85, x: 100, y: 280, deadlineMs: 38000 },
  ],
  tokens: [
    { id: 't1', x: 600, y: 200 },
    { id: 't2', x: 900, y: 400 },
  ],
});

export const ROBO_GARDEN = buildTrack({
  id: 'robo_garden',
  name: 'Robo Garden Run',
  namePl: 'Robo Garden Run',
  biome: 'garden',
  mainGimmick: 'mower_sprinkler',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['mower', 'sprinkler'],
  bgColor: 0x142018,
  accentColor: 0x40e878,
  centerline: [
    { x: 600, y: 160 },
    { x: 820, y: 200 },
    { x: 960, y: 360 },
    { x: 880, y: 560 },
    { x: 680, y: 640 },
    { x: 520, y: 640 },
    { x: 320, y: 560 },
    { x: 240, y: 360 },
    { x: 380, y: 200 },
    { x: 600, y: 160 },
  ],
  slipZones: [
    { id: 'sprinkler_mid', x: 500, y: 480, w: 200, h: 60 },
    { x: 420, y: 280, w: 160, h: 50 },
  ],
  boostPads: [{ x: 600, y: 520, w: 70, h: 35 }],
  hazards: [
    { id: 'mower1', kind: 'robot_mower', x1: 350, y1: 420, x2: 850, y2: 420, speed: 120, width: 32 },
    { id: 'mower2', kind: 'robot_mower', x1: 850, y1: 420, x2: 350, y2: 420, speed: 90, width: 28 },
  ],
  sprinklers: [
    { id: 'sp1', slipId: 'sprinkler_mid', cycleMs: 5000, activeMs: 2200, phaseOffsetMs: 0 },
  ],
  pickups: trackPickups(
    'robo_garden',
    ['p1', 'p2', 'p3'],
    [
      { x: 600, y: 350 },
      { x: 300, y: 450 },
      { x: 900, y: 450 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.3, x: 960, y: 360, deadlineMs: 11000 },
    { id: 'cp2', progress: 0.65, x: 320, y: 560, deadlineMs: 26000 },
  ],
  tokens: [{ id: 't1', x: 680, y: 300 }],
});

export const EV_GARAGE = buildTrack({
  id: 'ev_garage',
  name: 'EV Garage Grid',
  namePl: 'EV Garage Grid',
  biome: 'garage',
  mainGimmick: 'photocell_gates',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['photocell', 'charger'],
  bgColor: 0x181820,
  accentColor: 0xffa030,
  centerline: [
    { x: 200, y: 200 },
    { x: 500, y: 160 },
    { x: 800, y: 160 },
    { x: 1000, y: 280 },
    { x: 1000, y: 520 },
    { x: 800, y: 640 },
    { x: 500, y: 680 },
    { x: 200, y: 640 },
    { x: 120, y: 520 },
    { x: 120, y: 280 },
    { x: 200, y: 200 },
  ],
  boostPads: [
    { x: 600, y: 400, w: 90, h: 40 },
    { x: 300, y: 500, w: 70, h: 35 },
  ],
  gates: [
    { id: 'gate_shortcut', x: 650, y: 350, w: 20, h: 80, shortcut: true, defaultOpen: false },
    { id: 'gate_main', x: 480, y: 620, w: 80, h: 20, defaultOpen: true },
  ],
  photocells: [
    { id: 'photo1', gateId: 'gate_shortcut', x: 620, y: 320, w: 50, h: 50, autoClose: true },
  ],
  cameraTraps: [{ id: 'cam1', x: 650, y: 380, radius: 90 }],
  pickups: trackPickups(
    'ev_garage',
    ['p1', 'p2', 'p3'],
    [
      { x: 400, y: 300 },
      { x: 900, y: 400 },
      { x: 250, y: 550 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.25, x: 1000, y: 280, deadlineMs: 12000 },
    { id: 'cp2', progress: 0.6, x: 200, y: 640, deadlineMs: 30000 },
  ],
  tokens: [{ id: 't1', x: 600, y: 400 }],
});

export const SECURITY_HUB = buildTrack({
  id: 'security_hub',
  name: 'Security Hub Chase',
  namePl: 'Security Hub Chase',
  biome: 'security',
  mainGimmick: 'camera_gates',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['camera', 'laser'],
  bgColor: 0x120818,
  accentColor: 0xff4080,
  centerline: [
    { x: 600, y: 120 },
    { x: 900, y: 160 },
    { x: 1050, y: 320 },
    { x: 980, y: 520 },
    { x: 780, y: 660 },
    { x: 420, y: 660 },
    { x: 220, y: 520 },
    { x: 150, y: 320 },
    { x: 300, y: 160 },
    { x: 600, y: 120 },
  ],
  cameraTraps: [
    { id: 'cam_a', x: 900, y: 300, radius: 85 },
    { id: 'cam_b', x: 300, y: 300, radius: 85 },
    { id: 'cam_c', x: 600, y: 550, radius: 75 },
  ],
  gates: [
    { id: 'gate_a', x: 880, y: 280, w: 20, h: 70, shortcut: true, defaultOpen: false },
    { id: 'gate_b', x: 300, y: 280, w: 20, h: 70, shortcut: true, defaultOpen: false, trigger: 'laser' },
  ],
  pickups: trackPickups(
    'security_hub',
    ['p1', 'p2', 'p3'],
    [
      { x: 600, y: 250 },
      { x: 780, y: 500 },
      { x: 420, y: 500 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.2, x: 1050, y: 320, deadlineMs: 10000 },
    { id: 'cp2', progress: 0.55, x: 420, y: 660, deadlineMs: 26000 },
  ],
});

export const DRONE_DEPOT = buildTrack({
  id: 'drone_depot',
  name: 'Delivery Drone Depot',
  namePl: 'Delivery Drone Depot',
  biome: 'warehouse',
  mainGimmick: 'drone_conveyor',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['drone', 'conveyor'],
  bgColor: 0x141820,
  accentColor: 0x80a0ff,
  centerline: [
    { x: 180, y: 400 },
    { x: 300, y: 200 },
    { x: 600, y: 140 },
    { x: 900, y: 200 },
    { x: 1020, y: 400 },
    { x: 900, y: 600 },
    { x: 600, y: 660 },
    { x: 300, y: 600 },
    { x: 180, y: 400 },
  ],
  hazards: [
    { id: 'drone1', kind: 'drone_drop', x1: 450, y1: 250, x2: 750, y2: 250, speed: 80, width: 40 },
    { id: 'conv1', kind: 'conveyor', x1: 550, y1: 450, x2: 650, y2: 450, speed: 100, width: 60 },
    { id: 'conv2', kind: 'conveyor', x1: 350, y1: 520, x2: 450, y2: 520, speed: 90, width: 55 },
  ],
  boostPads: [{ x: 600, y: 400, w: 80, h: 40 }],
  pickups: trackPickups(
    'drone_depot',
    ['p1', 'p2', 'p3'],
    [
      { x: 400, y: 350 },
      { x: 800, y: 350 },
      { x: 600, y: 550 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.3, x: 900, y: 200, deadlineMs: 11000 },
    { id: 'cp2', progress: 0.7, x: 300, y: 600, deadlineMs: 28000 },
  ],
});

export const LIVING_ROOM = buildTrack({
  id: 'living_room',
  name: 'Living Room Neon Loop',
  namePl: 'Living Room Neon Loop',
  biome: 'living',
  mainGimmick: 'rhythm_lights',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['vacuum', 'lights'],
  bgColor: 0x180818,
  accentColor: 0xff40ff,
  centerline: [
    { x: 600, y: 180 },
    { x: 860, y: 220 },
    { x: 980, y: 400 },
    { x: 860, y: 580 },
    { x: 600, y: 620 },
    { x: 340, y: 580 },
    { x: 220, y: 400 },
    { x: 340, y: 220 },
    { x: 600, y: 180 },
  ],
  hazards: [
    { id: 'vac_lr', kind: 'robot_vacuum', x1: 400, y1: 400, x2: 800, y2: 400, speed: 130, width: 34 },
  ],
  slipZones: [{ x: 520, y: 380, w: 160, h: 50 }],
  boostPads: [
    { x: 600, y: 300, w: 60, h: 30 },
    { x: 600, y: 500, w: 60, h: 30 },
  ],
  rhythmSectors: [
    { id: 'rh1', x: 520, y: 360, w: 160, h: 80, cycleMs: 3500, activeMs: 1800, phaseOffsetMs: 0 },
  ],
  pickups: trackPickups(
    'living_room',
    ['p1', 'p2', 'p3'],
    [
      { x: 750, y: 350 },
      { x: 450, y: 350 },
      { x: 600, y: 450 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.35, x: 980, y: 400, deadlineMs: 12000 },
    { id: 'cp2', progress: 0.75, x: 220, y: 400, deadlineMs: 28000 },
  ],
});

export const BALCONY_WIND = buildTrack({
  id: 'balcony_wind',
  name: 'Balcony Wind Lab',
  namePl: 'Balcony Wind Lab',
  biome: 'balcony',
  mainGimmick: 'wind_blinds',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['wind', 'blinds'],
  bgColor: 0x101828,
  accentColor: 0x60c0e0,
  centerline: [
    { x: 150, y: 400 },
    { x: 280, y: 180 },
    { x: 600, y: 100 },
    { x: 920, y: 180 },
    { x: 1050, y: 400 },
    { x: 920, y: 620 },
    { x: 600, y: 700 },
    { x: 280, y: 620 },
    { x: 150, y: 400 },
  ],
  slipZones: [
    { x: 500, y: 200, w: 200, h: 40 },
    { x: 500, y: 560, w: 200, h: 40 },
  ],
  gates: [{ id: 'blind_short', x: 580, y: 350, w: 40, h: 20, shortcut: true, defaultOpen: false, trigger: 'blinds' }],
  boostPads: [{ x: 600, y: 400, w: 70, h: 35 }],
  pickups: trackPickups(
    'balcony_wind',
    ['p1', 'p2', 'p3'],
    [
      { x: 350, y: 350 },
      { x: 850, y: 350 },
      { x: 600, y: 600 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.25, x: 920, y: 180, deadlineMs: 10000 },
    { id: 'cp2', progress: 0.65, x: 280, y: 620, deadlineMs: 26000 },
  ],
});

export const DATA_DESK = buildTrack({
  id: 'data_desk',
  name: 'Data Desk Raceway',
  namePl: 'Data Desk Raceway',
  biome: 'desk',
  mainGimmick: 'key_trampoline',
  lapCount: 3,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['keys', 'cables'],
  bgColor: 0x1a1a20,
  accentColor: 0xa0a0ff,
  centerline: [
    { x: 300, y: 250 },
    { x: 600, y: 200 },
    { x: 900, y: 250 },
    { x: 1000, y: 450 },
    { x: 900, y: 650 },
    { x: 600, y: 700 },
    { x: 300, y: 650 },
    { x: 200, y: 450 },
    { x: 300, y: 250 },
  ],
  boostPads: [
    { x: 600, y: 350, w: 100, h: 30 },
    { x: 400, y: 500, w: 60, h: 30 },
    { x: 800, y: 500, w: 60, h: 30 },
  ],
  slipZones: [{ x: 550, y: 580, w: 100, h: 60 }],
  hazards: [
    { id: 'vac_desk', kind: 'robot_vacuum', x1: 350, y1: 450, x2: 850, y2: 450, speed: 150, width: 30 },
  ],
  trampolines: [
    { x: 550, y: 420, w: 100, h: 40, angle: -0.4, impulse: 180 },
    { x: 650, y: 520, w: 80, h: 35, angle: 0.5, impulse: 160 },
  ],
  pickups: trackPickups(
    'data_desk',
    ['p1', 'p2', 'p3'],
    [
      { x: 600, y: 450 },
      { x: 350, y: 350 },
      { x: 850, y: 350 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.3, x: 1000, y: 450, deadlineMs: 11000 },
    { id: 'cp2', progress: 0.7, x: 300, y: 650, deadlineMs: 27000 },
  ],
});

export const SMART_CITY = buildTrack({
  id: 'smart_city',
  name: 'Smart City Model Track',
  namePl: 'Smart City Model Track',
  biome: 'city',
  mainGimmick: 'traffic_signals',
  lapCount: 4,
  supportsElimination: true,
  supportsTimeTrial: true,
  hazardSets: ['traffic', 'ev_bus'],
  bgColor: 0x0a1020,
  accentColor: 0x40ff80,
  trackWidth: 95,
  centerline: [
    { x: 600, y: 100 },
    { x: 950, y: 140 },
    { x: 1100, y: 300 },
    { x: 1050, y: 500 },
    { x: 850, y: 680 },
    { x: 600, y: 720 },
    { x: 350, y: 680 },
    { x: 150, y: 500 },
    { x: 100, y: 300 },
    { x: 250, y: 140 },
    { x: 600, y: 100 },
  ],
  hazards: [
    { id: 'bus1', kind: 'robot_mower', x1: 400, y1: 400, x2: 800, y2: 400, speed: 110, width: 38 },
    { id: 'drone_city', kind: 'drone_drop', x1: 600, y1: 200, x2: 600, y2: 600, speed: 70, width: 35 },
  ],
  cameraTraps: [{ id: 'city_cam', x: 600, y: 400, radius: 100 }],
  gates: [
    { id: 'city_short', x: 580, y: 500, w: 40, h: 20, shortcut: true, defaultOpen: false },
    { id: 'city_round', x: 400, y: 400, w: 20, h: 60, shortcut: true, defaultOpen: false },
  ],
  trafficSignals: [
    { id: 'sig_main', gateIds: ['city_short', 'city_round'], cycleMs: 5000, greenMs: 2800, phaseOffsetMs: 0 },
  ],
  boostPads: [
    { x: 600, y: 600, w: 80, h: 35 },
    { x: 600, y: 200, w: 80, h: 35 },
  ],
  pickups: trackPickups(
    'smart_city',
    ['p1', 'p2', 'p3'],
    [
      { x: 900, y: 350 },
      { x: 300, y: 350 },
      { x: 600, y: 450 },
    ],
  ),
  checkpoints: [
    { id: 'cp1', progress: 0.15, x: 1100, y: 300, deadlineMs: 9000 },
    { id: 'cp2', progress: 0.4, x: 850, y: 680, deadlineMs: 22000 },
    { id: 'cp3', progress: 0.65, x: 150, y: 500, deadlineMs: 36000 },
    { id: 'cp4', progress: 0.9, x: 250, y: 140, deadlineMs: 50000 },
  ],
  tokens: [
    { id: 't1', x: 600, y: 400 },
    { id: 't2', x: 400, y: 600 },
    { id: 't3', x: 800, y: 200 },
  ],
});

export const TRACKS = [
  SMART_KITCHEN,
  SOLAR_ROOF,
  ROBO_GARDEN,
  EV_GARAGE,
  SECURITY_HUB,
  DRONE_DEPOT,
  LIVING_ROOM,
  BALCONY_WIND,
  DATA_DESK,
  SMART_CITY,
];

export function trackById(id: string) {
  const t = TRACKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown track: ${id}`);
  return t;
}

export function defaultUnlockedTracks(): string[] {
  return TRACKS.filter((t) => t.unlockedByDefault).map((t) => t.id);
}
