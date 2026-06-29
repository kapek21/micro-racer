import type { GameModeId } from '../core/types.js';
import { defaultUnlockedTracks } from '../config/tracks/index.js';

export interface VehicleMastery {
  races: number;
  wins: number;
  bestTimeMs: number;
}

export interface TrackBadge {
  id: string;
  namePl: string;
  earnedAt: number;
}

export interface GoalProgress {
  id: string;
  labelPl: string;
  target: number;
  current: number;
  rewardCoins: number;
  period: 'daily' | 'weekly';
}

export interface CosmeticItem {
  id: string;
  namePl: string;
  kind: 'skin' | 'trail' | 'banner';
  price: number;
  vehicleId?: string;
}

export interface PlayerProfile {
  coins: number;
  driverLevel: number;
  driverXp: number;
  unlockedTracks: string[];
  ownedCosmetics: string[];
  equippedSkins: Record<string, string>;
  vehicleMastery: Record<string, VehicleMastery>;
  trackBadges: Record<string, TrackBadge[]>;
  dailyGoals: GoalProgress[];
  weeklyGoals: GoalProgress[];
  totalRaces: number;
  totalWins: number;
}

const STORAGE_KEY = 'micro-racer-profile-v1';

export const COSMETICS: CosmeticItem[] = [
  { id: 'skin_volt_neon', namePl: 'Volt Neon', kind: 'skin', price: 200, vehicleId: 'volt_mini_gt' },
  { id: 'skin_sweep_camo', namePl: 'Sweep Camo', kind: 'skin', price: 200, vehicleId: 'sweep_x_buggy' },
  { id: 'skin_charge_gold', namePl: 'Charge Gold', kind: 'skin', price: 250, vehicleId: 'charge_van' },
  { id: 'skin_photon_chrome', namePl: 'Photon Chrome', kind: 'skin', price: 250, vehicleId: 'photon_racer' },
  { id: 'trail_spark', namePl: 'Iskry', kind: 'trail', price: 150 },
  { id: 'trail_holo', namePl: 'Hologram', kind: 'trail', price: 300 },
  { id: 'banner_smart', namePl: 'Smart Home', kind: 'banner', price: 100 },
  { id: 'banner_rush', namePl: 'Circuit Rush', kind: 'banner', price: 120 },
];

function defaultGoals(): { daily: GoalProgress[]; weekly: GoalProgress[] } {
  return {
    daily: [
      { id: 'd_win', labelPl: 'Wygraj 1 wyścig', target: 1, current: 0, rewardCoins: 30, period: 'daily' },
      { id: 'd_tokens', labelPl: 'Zbierz 5 tokenów', target: 5, current: 0, rewardCoins: 20, period: 'daily' },
      { id: 'd_boost', labelPl: 'Użyj 3 boost padów', target: 3, current: 0, rewardCoins: 15, period: 'daily' },
    ],
    weekly: [
      { id: 'w_races', labelPl: 'Ukończ 10 wyścigów', target: 10, current: 0, rewardCoins: 100, period: 'weekly' },
      { id: 'w_tracks', labelPl: 'Wygraj na 3 trasach', target: 3, current: 0, rewardCoins: 80, period: 'weekly' },
      { id: 'w_emp', labelPl: 'Użyj EMP 5 razy', target: 5, current: 0, rewardCoins: 60, period: 'weekly' },
    ],
  };
}

export function createDefaultProfile(): PlayerProfile {
  const goals = defaultGoals();
  return {
    coins: 0,
    driverLevel: 1,
    driverXp: 0,
    unlockedTracks: defaultUnlockedTracks(),
    ownedCosmetics: [],
    equippedSkins: {},
    vehicleMastery: {},
    trackBadges: {},
    dailyGoals: goals.daily,
    weeklyGoals: goals.weekly,
    totalRaces: 0,
    totalWins: 0,
  };
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as PlayerProfile;
    return { ...createDefaultProfile(), ...parsed };
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function xpForLevel(level: number): number {
  return level * 120;
}

export function addDriverXp(profile: PlayerProfile, xp: number): void {
  profile.driverXp += xp;
  while (profile.driverXp >= xpForLevel(profile.driverLevel)) {
    profile.driverXp -= xpForLevel(profile.driverLevel);
    profile.driverLevel += 1;
    unlockTrackByLevel(profile);
  }
}

function unlockTrackByLevel(profile: PlayerProfile): void {
  const unlockOrder = [
    'robo_garden',
    'ev_garage',
    'security_hub',
    'drone_depot',
    'living_room',
    'balcony_wind',
    'data_desk',
    'smart_city',
  ];
  const idx = profile.driverLevel - 2;
  if (idx >= 0 && idx < unlockOrder.length) {
    const id = unlockOrder[idx]!;
    if (!profile.unlockedTracks.includes(id)) profile.unlockedTracks.push(id);
  }
}

export interface RaceResultInput {
  trackId: string;
  vehicleId: string;
  mode: GameModeId;
  position: number;
  won: boolean;
  coinsEarned: number;
  tokensCollected: number;
  finishTimeMs: number;
}

export function applyRaceResult(profile: PlayerProfile, result: RaceResultInput): void {
  profile.totalRaces += 1;
  if (result.won) profile.totalWins += 1;
  profile.coins += result.coinsEarned;

  const vm = profile.vehicleMastery[result.vehicleId] ?? {
    races: 0,
    wins: 0,
    bestTimeMs: Infinity,
  };
  vm.races += 1;
  if (result.won) vm.wins += 1;
  if (result.finishTimeMs > 0) vm.bestTimeMs = Math.min(vm.bestTimeMs, result.finishTimeMs);
  profile.vehicleMastery[result.vehicleId] = vm;

  addDriverXp(profile, 25 + (result.won ? 40 : 10) + result.tokensCollected * 2);

  bumpGoal(profile.dailyGoals, 'd_win', result.won ? 1 : 0);
  bumpGoal(profile.dailyGoals, 'd_tokens', result.tokensCollected);
  bumpGoal(profile.weeklyGoals, 'w_races', 1);
  if (result.won) bumpGoal(profile.weeklyGoals, 'w_tracks', 1);

  payGoalRewards(profile);
  saveProfile(profile);
}

function bumpGoal(goals: GoalProgress[], id: string, delta: number): void {
  const g = goals.find((x) => x.id === id);
  if (!g || g.current >= g.target) return;
  g.current = Math.min(g.target, g.current + delta);
}

function payGoalRewards(profile: PlayerProfile): void {
  for (const g of [...profile.dailyGoals, ...profile.weeklyGoals]) {
    if (g.current >= g.target && g.rewardCoins > 0) {
      profile.coins += g.rewardCoins;
      g.rewardCoins = 0;
    }
  }
}

export function buyCosmetic(profile: PlayerProfile, itemId: string): boolean {
  const item = COSMETICS.find((c) => c.id === itemId);
  if (!item || profile.ownedCosmetics.includes(itemId)) return false;
  if (profile.coins < item.price) return false;
  profile.coins -= item.price;
  profile.ownedCosmetics.push(itemId);
  if (item.kind === 'skin' && item.vehicleId) {
    profile.equippedSkins[item.vehicleId] = itemId;
  }
  saveProfile(profile);
  return true;
}

export function isTrackUnlocked(profile: PlayerProfile, trackId: string): boolean {
  return profile.unlockedTracks.includes(trackId);
}
