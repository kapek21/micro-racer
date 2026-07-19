import type { GameModeId } from '../core/types.js';
import { defaultUnlockedTracks, TRACKS } from '../config/tracks/index.js';

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

export interface TrackBest {
  bestScore: number;
  bestTimeMs: number;
  bestBuildPoints: number;
}

export interface PlayerProfile {
  coins: number;
  driverLevel: number;
  driverXp: number;
  unlockedTracks: string[];
  ownedCosmetics: string[];
  equippedSkins: Record<string, string>;
  equippedTrail: string | null;
  vehicleMastery: Record<string, VehicleMastery>;
  trackBadges: Record<string, TrackBadge[]>;
  trackBests: Record<string, TrackBest>;
  dailyGoals: GoalProgress[];
  weeklyGoals: GoalProgress[];
  goalsDailyKey: string;
  goalsWeeklyKey: string;
  /** Unique track ids won this week (for w_tracks goal). */
  weeklyWinTrackIds: string[];
  totalRaces: number;
  totalWins: number;
}

const STORAGE_KEY = 'micro-racer-profile-v2';

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
      { id: 'd_build', labelPl: 'Zdobyj 200 pkt budowy', target: 200, current: 0, rewardCoins: 25, period: 'daily' },
    ],
    weekly: [
      { id: 'w_races', labelPl: 'Ukończ 10 wyścigów', target: 10, current: 0, rewardCoins: 100, period: 'weekly' },
      { id: 'w_tracks', labelPl: 'Wygraj na 3 trasach', target: 3, current: 0, rewardCoins: 80, period: 'weekly' },
      { id: 'w_score', labelPl: 'Zbierz 3000 pkt rankingu', target: 3000, current: 0, rewardCoins: 120, period: 'weekly' },
    ],
  };
}

function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function weekKey(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
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
    equippedTrail: null,
    vehicleMastery: {},
    trackBadges: {},
    trackBests: {},
    dailyGoals: goals.daily,
    weeklyGoals: goals.weekly,
    goalsDailyKey: dayKey(),
    goalsWeeklyKey: weekKey(),
    weeklyWinTrackIds: [],
    totalRaces: 0,
    totalWins: 0,
  };
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    const base = createDefaultProfile();
    const profile: PlayerProfile = {
      ...base,
      ...parsed,
      unlockedTracks: migrateTracks(parsed.unlockedTracks ?? base.unlockedTracks),
      trackBests: parsed.trackBests ?? {},
      equippedTrail: parsed.equippedTrail ?? null,
      ownedCosmetics: parsed.ownedCosmetics ?? [],
      equippedSkins: parsed.equippedSkins ?? {},
      dailyGoals: parsed.dailyGoals ?? base.dailyGoals,
      weeklyGoals: parsed.weeklyGoals ?? base.weeklyGoals,
      goalsDailyKey: parsed.goalsDailyKey ?? '',
      goalsWeeklyKey: parsed.goalsWeeklyKey ?? '',
      weeklyWinTrackIds: parsed.weeklyWinTrackIds ?? [],
    };
    refreshGoalsIfNeeded(profile);
    return profile;
  } catch {
    return createDefaultProfile();
  }
}

function refreshGoalsIfNeeded(profile: PlayerProfile): void {
  const d = dayKey();
  const w = weekKey();
  const fresh = defaultGoals();
  let dirty = false;
  if (profile.goalsDailyKey !== d) {
    profile.dailyGoals = fresh.daily;
    profile.goalsDailyKey = d;
    dirty = true;
  }
  if (profile.goalsWeeklyKey !== w) {
    profile.weeklyGoals = fresh.weekly;
    profile.goalsWeeklyKey = w;
    profile.weeklyWinTrackIds = [];
    dirty = true;
  }
  if (dirty) saveProfile(profile);
}

function migrateTracks(ids: string[]): string[] {
  const valid = new Set(TRACKS.map((t) => t.id));
  const filtered = ids.filter((id) => valid.has(id));
  if (filtered.length === 0) return defaultUnlockedTracks();
  return filtered;
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
  const unlockOrder = ['garage_8', 'balcony_8', 'desk_8'];
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
  buildPoints: number;
  timePoints: number;
  raceScore: number;
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

  const best = profile.trackBests[result.trackId] ?? {
    bestScore: 0,
    bestTimeMs: Infinity,
    bestBuildPoints: 0,
  };
  best.bestScore = Math.max(best.bestScore, result.raceScore);
  best.bestBuildPoints = Math.max(best.bestBuildPoints, result.buildPoints);
  if (result.finishTimeMs > 0) best.bestTimeMs = Math.min(best.bestTimeMs, result.finishTimeMs);
  profile.trackBests[result.trackId] = best;

  addDriverXp(
    profile,
    25 +
      (result.won ? 40 : 10) +
      result.tokensCollected * 2 +
      Math.floor(result.raceScore / 50),
  );

  bumpGoal(profile.dailyGoals, 'd_win', result.won ? 1 : 0);
  bumpGoal(profile.dailyGoals, 'd_tokens', result.tokensCollected);
  bumpGoal(profile.dailyGoals, 'd_build', result.buildPoints);
  bumpGoal(profile.weeklyGoals, 'w_races', 1);
  if (result.won) {
    if (!profile.weeklyWinTrackIds.includes(result.trackId)) {
      profile.weeklyWinTrackIds.push(result.trackId);
    }
    const g = profile.weeklyGoals.find((x) => x.id === 'w_tracks');
    if (g) g.current = Math.min(g.target, profile.weeklyWinTrackIds.length);
  }
  bumpGoal(profile.weeklyGoals, 'w_score', result.raceScore);

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
  if (item.kind === 'trail') {
    profile.equippedTrail = itemId;
  }
  saveProfile(profile);
  return true;
}

export function equipCosmetic(profile: PlayerProfile, itemId: string): boolean {
  if (!profile.ownedCosmetics.includes(itemId)) return false;
  const item = COSMETICS.find((c) => c.id === itemId);
  if (!item) return false;
  if (item.kind === 'trail') {
    profile.equippedTrail = profile.equippedTrail === itemId ? null : itemId;
  } else if (item.kind === 'skin' && item.vehicleId) {
    profile.equippedSkins[item.vehicleId] = itemId;
  }
  saveProfile(profile);
  return true;
}

export function equippedTrailId(profile: PlayerProfile): string | null {
  return profile.equippedTrail;
}

export function isTrackUnlocked(profile: PlayerProfile, trackId: string): boolean {
  return profile.unlockedTracks.includes(trackId);
}
