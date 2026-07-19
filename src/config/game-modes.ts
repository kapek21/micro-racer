import type { GameModeConfig, GameModeId } from '../core/types.js';

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'standard_race',
    namePl: 'Wyścig AI',
    descriptionPl: '3 okrążenia na ósemce przeciw AI. Punkty = budowa + czas.',
    racerCount: 4,
    lapCount: 3,
    offensivePickups: true,
    requiresCheckpoints: false,
  },
];

export function gameModeById(id: GameModeId): GameModeConfig {
  const m = GAME_MODES.find((x) => x.id === id);
  if (!m) return GAME_MODES[0]!;
  return m;
}
