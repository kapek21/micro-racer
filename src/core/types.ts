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
  /** Par czas całego wyścigu (ms) — cel do punktacji. */
  parTimeMs?: number;
  /** Docelowy czas jednego okrążenia (ms). */
  targetLapMs?: number;
}

export interface ElevationZoneDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Ujemne = podjazd (wolniej), dodatnie = zjazd / rampa (szybciej). */
  grade: number;
  ramp?: boolean;
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
  trigger?: 'default' | 'photocell' | 'traffic' | 'rhythm' | 'blinds' | 'laser';
}

export interface HeatZoneDef {
  x: number;
  y: number;
  w: number;
  h: number;
  gripMult: number;
  boostOnExit?: boolean;
}

export interface PhotocellDef {
  id: string;
  gateId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  autoClose?: boolean;
}

export interface TrafficSignalDef {
  id: string;
  gateIds: string[];
  cycleMs: number;
  greenMs: number;
  phaseOffsetMs?: number;
}

export interface RhythmSectorDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cycleMs: number;
  activeMs: number;
  phaseOffsetMs?: number;
  gateId?: string;
}

export interface SprinklerDef {
  id: string;
  slipId: string;
  cycleMs: number;
  activeMs: number;
  phaseOffsetMs?: number;
}

export interface TrampolineDef {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  impulse: number;
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

export interface SlipZoneDef {
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TrackDef extends TrackConfig {
  centerline: Vec2[];
  trackWidth: number;
  startPositions: Vec2[];
  startAngles: number[];
  hazards: HazardDef[];
  pickups: PickupSpawn[];
  slipZones: SlipZoneDef[];
  boostPads: { x: number; y: number; w: number; h: number }[];
  checkpoints: CheckpointDef[];
  gates: GateDef[];
  cameraTraps: CameraTrapDef[];
  tokens: TokenSpawn[];
  heatZones?: HeatZoneDef[];
  photocells?: PhotocellDef[];
  trafficSignals?: TrafficSignalDef[];
  rhythmSectors?: RhythmSectorDef[];
  sprinklers?: SprinklerDef[];
  trampolines?: TrampolineDef[];
  elevationZones?: ElevationZoneDef[];
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
  lastCheckpointCrossMs: number;
  elevationGrade: number;
  onRamp: boolean;
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

export interface GimmickRuntimeState {
  phase: number;
  timers: Record<string, number>;
  flags: Record<string, boolean>;
  activeSlipIds: Set<string>;
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
  currentLapMs: number;
  lapTimes: number[];
  sectorSplits: number[];
  raceScore: number;
  deltaParMs: number;
  nextCheckpointLabel: string;
  nextCheckpointDeadlineMs: number;
  lastSectorMs: number;
  parTimeMs: number;
  targetLapMs: number;
  offensivePickupsAllowed: boolean;
  hazardIntensity: number;
  gimmickState: GimmickRuntimeState;
  empUsesThisRace: number;
}

export interface PlayerInput {
  steer: number;
  throttle: number;
  brake: boolean;
  handbrake: boolean;
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
