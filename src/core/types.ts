export const WORLD_W = 1200;
export const WORLD_H = 800;

export type VehicleClass = 'balanced' | 'agile' | 'heavy' | 'speed';
export type RacePhase = 'menu' | 'countdown' | 'racing' | 'finished';
export type PowerUpCategory = 'mobility' | 'offense' | 'defense' | 'utility';
export type PowerUpRarity = 'common' | 'rare' | 'epic';
export type GameModeId =
  | 'standard_race'
  | 'elimination_camera'
  | 'time_trial'
  | 'checkpoint_rush'
  | 'hazard_run'
  | 'battle_lap';

export interface Vec2 {
  x: number;
  y: number;
}

export interface VehicleConfig {
  id: string;
  name: string;
  namePl: string;
  class: VehicleClass;
  color: number;
  accent: number;
  acceleration: number;
  topSpeed: number;
  traction: number;
  turnRate: number;
  collisionResistance: number;
  boostEfficiency: number;
  recoverySpeed: number;
}

export interface PowerUpConfig {
  id: string;
  namePl: string;
  category: PowerUpCategory;
  rarity: PowerUpRarity;
  durationMs?: number;
  charges?: number;
  offensive?: boolean;
}

export interface TrackConfig {
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
}

export interface CheckpointDef {
  id: string;
  progress: number;
  x: number;
  y: number;
  deadlineMs: number;
}

export interface GateDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shortcut?: boolean;
  defaultOpen?: boolean;
}

export interface CameraTrapDef {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface TokenSpawn {
  id: string;
  x: number;
  y: number;
}

export type HazardKind =
  | 'robot_vacuum'
  | 'robot_mower'
  | 'slip_zone'
  | 'boost_pad'
  | 'conveyor'
  | 'drone_drop';

export interface HazardDef {
  id: string;
  kind: HazardKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  speed?: number;
  width?: number;
}

export interface PickupSpawn {
  id: string;
  powerUpId: string;
  x: number;
  y: number;
  respawnMs: number;
}

export interface TrackDef extends TrackConfig {
  centerline: Vec2[];
  trackWidth: number;
  startPositions: Vec2[];
  startAngles: number[];
  hazards: HazardDef[];
  pickups: PickupSpawn[];
  slipZones: { x: number; y: number; w: number; h: number }[];
  boostPads: { x: number; y: number; w: number; h: number }[];
  checkpoints: CheckpointDef[];
  gates: GateDef[];
  cameraTraps: CameraTrapDef[];
  tokens: TokenSpawn[];
  bgColor: number;
  accentColor: number;
}

export interface ActivePowerUp {
  id: string;
  remainingMs: number;
  charges: number;
}

export interface MineState {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  lifeMs: number;
}

export interface FoamPatch {
  x: number;
  y: number;
  lifeMs: number;
}

export interface RacerState {
  id: string;
  vehicleId: string;
  isPlayer: boolean;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  speed: number;
  lap: number;
  lapProgress: number;
  totalProgress: number;
  finished: boolean;
  finishTimeMs: number;
  position: number;
  boostMs: number;
  boostCooldownMs: number;
  shieldMs: number;
  gripMs: number;
  empSlowMs: number;
  overchargeMs: number;
  jamBlockerMs: number;
  cameraCloakMs: number;
  autoCorrectMs: number;
  magnetMs: number;
  chargeLinkMs: number;
  gateHackMs: number;
  paintFoamMs: number;
  sideDashCooldownMs: number;
  droneZapTargetId: string | null;
  droneZapTimerMs: number;
  heldPowerUp: ActivePowerUp | null;
  offTrackMs: number;
  stuckMs: number;
  eliminationStrikes: number;
  eliminated: boolean;
  checkpointIndex: number;
  tokensCollected: number;
}

export interface PickupState {
  spawnId: string;
  powerUpId: string;
  x: number;
  y: number;
  active: boolean;
  respawnTimerMs: number;
  respawnMs: number;
}

export interface HazardState {
  id: string;
  kind: HazardDef['kind'];
  x: number;
  y: number;
  angle: number;
  t: number;
}

export interface TokenState {
  id: string;
  x: number;
  y: number;
  active: boolean;
}

export interface RaceState {
  phase: RacePhase;
  mode: GameModeId;
  trackId: string;
  lapCount: number;
  timeMs: number;
  countdownMs: number;
  racers: RacerState[];
  hazards: HazardState[];
  pickups: PickupState[];
  tokens: TokenState[];
  mines: MineState[];
  foamPatches: FoamPatch[];
  gateOpen: Record<string, boolean>;
  message: string;
  messageTimerMs: number;
  playerVehicleId: string;
  coinsEarned: number;
  stylePoints: number;
  checkpointDeadlineMs: number;
  bestLapMs: number;
  currentLapStartMs: number;
  offensivePickupsAllowed: boolean;
}

export interface PlayerInput {
  steer: number;
  throttle: number;
  boost: boolean;
  usePowerUp: boolean;
}

export interface GameModeConfig {
  id: GameModeId;
  namePl: string;
  descriptionPl: string;
  racerCount: number;
  lapCount?: number;
  offensivePickups: boolean;
  requiresCheckpoints: boolean;
  eliminationStrikes?: number;
}
