import { create } from 'zustand';
import type { GameModeId, RacePhase } from '../core/types.js';
import { loadProfile, type PlayerProfile } from '../meta/profile.js';

export type MenuScreen = 'race' | 'progress' | 'shop';

export interface HudSnapshot {
  phase: RacePhase;
  lap: number;
  lapCount: number;
  position: number;
  racerCount: number;
  speed: number;
  timeMs: number;
  countdownMs: number;
  message: string;
  boostActive: boolean;
  shieldActive: boolean;
  heldPowerUp: string;
  coinsEarned: number;
  stylePoints: number;
  tokensCollected: number;
  modeLabel: string;
  trackLabel: string;
  eliminationStrikes: number;
  checkpointIndex: number;
  checkpointTotal: number;
  selectedVehicleId: string;
  selectedTrackId: string;
  selectedModeId: GameModeId;
  menuScreen: MenuScreen;
}

interface HudStore {
  profile: PlayerProfile;
  snapshot: HudSnapshot;
  setSnapshot: (p: Partial<HudSnapshot>) => void;
  reloadProfile: () => void;
}

export const useHudStore = create<HudStore>((set) => ({
  profile: loadProfile(),
  snapshot: {
    phase: 'menu',
    lap: 0,
    lapCount: 3,
    position: 1,
    racerCount: 4,
    speed: 0,
    timeMs: 0,
    countdownMs: 0,
    message: '',
    boostActive: false,
    shieldActive: false,
    heldPowerUp: '',
    coinsEarned: 0,
    stylePoints: 0,
    tokensCollected: 0,
    modeLabel: '',
    trackLabel: '',
    eliminationStrikes: 0,
    checkpointIndex: 0,
    checkpointTotal: 0,
    selectedVehicleId: 'volt_mini_gt',
    selectedTrackId: 'smart_kitchen',
    selectedModeId: 'standard_race',
    menuScreen: 'race',
  },
  setSnapshot: (p) => set((s) => ({ snapshot: { ...s.snapshot, ...p } })),
  reloadProfile: () => set({ profile: loadProfile() }),
}));
