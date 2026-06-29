import type { GameModeConfig, GameModeId } from '../core/types.js';

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'standard_race',
    namePl: 'Standard Race',
    descriptionPl: 'Klasyczny wyścig na 3 okrążenia. Wygrywa pierwszy na mecie.',
    racerCount: 4,
    offensivePickups: true,
    requiresCheckpoints: false,
  },
  {
    id: 'elimination_camera',
    namePl: 'Elimination Camera',
    descriptionPl: 'Kamera podąża za liderem. Wypadnięcie z kadru = utrata punktu.',
    racerCount: 4,
    offensivePickups: true,
    requiresCheckpoints: false,
    eliminationStrikes: 3,
  },
  {
    id: 'time_trial',
    namePl: 'Time Trial',
    descriptionPl: 'Solo bez ofensywnych power-upów. Liczy się idealna linia i czas.',
    racerCount: 1,
    offensivePickups: false,
    requiresCheckpoints: false,
  },
  {
    id: 'checkpoint_rush',
    namePl: 'Checkpoint Rush',
    descriptionPl: 'Zdąż do kolejnych checkpointów zanim skończy się czas.',
    racerCount: 4,
    lapCount: 1,
    offensivePickups: true,
    requiresCheckpoints: true,
  },
  {
    id: 'hazard_run',
    namePl: 'Hazard Run',
    descriptionPl: 'Event hazardowy — środowisko jest głównym wrogiem.',
    racerCount: 4,
    lapCount: 2,
    offensivePickups: false,
    requiresCheckpoints: false,
  },
  {
    id: 'battle_lap',
    namePl: 'Battle Lap',
    descriptionPl: 'Chaos ofensywny — więcej power-upów, krótszy wyścig.',
    racerCount: 4,
    lapCount: 2,
    offensivePickups: true,
    requiresCheckpoints: false,
  },
];

export function gameModeById(id: GameModeId): GameModeConfig {
  const m = GAME_MODES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown mode: ${id}`);
  return m;
}
