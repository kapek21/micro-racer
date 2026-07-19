import { create } from 'zustand';
import type { GameModeId, RacePhase } from '../core/types.js';
import { loadProfile, type PlayerProfile } from '../meta/profile.js';
import type { BuildResult } from './build-minigames.js';

export type MenuScreen = 'race' | 'how' | 'progress' | 'shop';

const HOW_SEEN_KEY = 'micro-racer-seen-how-v1';

function initialMenuScreen(): MenuScreen {
  try {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(HOW_SEEN_KEY)) return 'how';
  } catch {
    /* ignore */
  }
  return 'race';
}

export function markHowToPlaySeen(): void {
  try {
    localStorage.setItem(HOW_SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}

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
  buildPoints: number;
  timePoints: number;
  raceScore: number;
  tokensCollected: number;
  modeLabel: string;
  trackLabel: string;
  surfaceLabel: string;
  eliminationStrikes: number;
  checkpointIndex: number;
  checkpointTotal: number;
  selectedTrackId: string;
  selectedModeId: GameModeId;
  menuScreen: MenuScreen;
  assetsReady: boolean;
  buildOpen: boolean;
  pendingBuild: BuildResult | null;
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
    buildPoints: 0,
    timePoints: 0,
    raceScore: 0,
    tokensCollected: 0,
    modeLabel: '',
    trackLabel: '',
    surfaceLabel: '',
    eliminationStrikes: 0,
    checkpointIndex: 0,
    checkpointTotal: 0,
    selectedTrackId: 'kitchen_8',
    selectedModeId: 'standard_race',
    menuScreen: initialMenuScreen(),
    assetsReady: false,
    buildOpen: false,
    pendingBuild: null,
  },
  setSnapshot: (p) => set((s) => ({ snapshot: { ...s.snapshot, ...p } })),
  reloadProfile: () => set({ profile: loadProfile() }),
}));
