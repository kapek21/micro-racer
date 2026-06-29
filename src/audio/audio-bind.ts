import type { GameAudio } from './game-audio.js';

let bound: GameAudio | null = null;
let muted = false;

export function bindGameAudio(audio: GameAudio): void {
  bound = audio;
}

export function unbindGameAudio(): void {
  bound = null;
}

export function isGameMuted(): boolean {
  return muted;
}

export function toggleGameMute(): boolean {
  muted = !muted;
  bound?.setMuted(muted);
  return muted;
}
