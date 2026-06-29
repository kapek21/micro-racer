import type { RacePhase, RaceState } from '../core/types.js';
import { playerRacer } from '../race/race-sim.js';
import { AudioContextHolder, playNoiseBurst, playSweep, playTone } from './synth.js';

/** Procedural arcade SFX + engine loop — no external files. */
export class GameAudio {
  private readonly holder = new AudioContextHolder();
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private muted = false;
  private unlocked = false;

  unlock(): void {
    if (this.unlocked) return;
    this.holder.unlock();
    this.unlocked = true;
    this.startEngine();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.engineGain) this.engineGain.gain.value = m ? 0 : 0.04;
  }

  private ctx(): AudioContext | null {
    return this.holder.context;
  }

  private startEngine(): void {
    const ctx = this.ctx();
    if (!ctx || this.engineOsc) return;

    this.engineOsc = ctx.createOscillator();
    this.engineFilter = ctx.createBiquadFilter();
    this.engineGain = ctx.createGain();

    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 400;
    this.engineGain.gain.value = this.muted ? 0 : 0.04;

    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(ctx.destination);
    this.engineOsc.start();
  }

  setEngine(speed: number, boosting: boolean): void {
    if (!this.engineOsc || !this.engineFilter || !this.engineGain) return;
    const ctx = this.ctx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const norm = Math.min(1, speed / 420);
    const base = 60 + norm * 140;
    this.engineOsc.frequency.setTargetAtTime(base, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(300 + norm * 1200 + (boosting ? 400 : 0), t, 0.1);
    const vol = this.muted ? 0 : 0.03 + norm * 0.05 + (boosting ? 0.03 : 0);
    this.engineGain.gain.setTargetAtTime(vol, t, 0.06);
  }

  stopEngine(): void {
    try {
      this.engineOsc?.stop();
    } catch {
      /* already stopped */
    }
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
  }

  countdownTick(secondsLeft: number): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    if (secondsLeft <= 0) {
      playSweep(ctx, 220, 880, 280, 0.1);
      playTone(ctx, 880, 120, 'square', 0.1);
    } else {
      playTone(ctx, secondsLeft === 1 ? 660 : 440, 90, 'square', 0.07);
    }
  }

  raceStart(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playSweep(ctx, 330, 990, 200, 0.08);
  }

  boost(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playSweep(ctx, 200, 600, 180, 0.06);
  }

  pickup(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playTone(ctx, 523, 60, 'square', 0.06);
    playTone(ctx, 784, 80, 'square', 0.05, 0.05);
  }

  token(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playTone(ctx, 988, 70, 'triangle', 0.06);
  }

  emp(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playNoiseBurst(ctx, 200, 0.08);
    playTone(ctx, 80, 250, 'sawtooth', 0.07);
  }

  collision(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playNoiseBurst(ctx, 80, 0.05);
    playTone(ctx, 120, 60, 'square', 0.04);
  }

  checkpoint(): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    playTone(ctx, 440, 50, 'square', 0.05);
    playTone(ctx, 660, 70, 'square', 0.05, 0.06);
  }

  finish(won: boolean): void {
    const ctx = this.ctx();
    if (!ctx || this.muted) return;
    if (won) {
      playTone(ctx, 523, 100, 'square', 0.07);
      playTone(ctx, 659, 100, 'square', 0.07, 0.1);
      playTone(ctx, 784, 180, 'square', 0.08, 0.2);
    } else {
      playTone(ctx, 330, 150, 'triangle', 0.06);
      playTone(ctx, 262, 200, 'triangle', 0.05, 0.12);
    }
  }

  destroy(): void {
    this.stopEngine();
    this.holder.destroy();
  }
}

/** Watches race state transitions and drives GameAudio. */
export class RaceAudioController {
  private prevPhase: RacePhase = 'menu';
  private prevCountdownSec = -1;
  private prevBoost = false;
  private prevHeld = '';
  private prevTokens = 0;
  private prevCheckpoint = 0;
  private prevSpeed = 0;
  private collisionCooldown = 0;

  constructor(private readonly audio: GameAudio) {}

  tick(state: RaceState, dtMs: number): void {
    if (state.phase === 'menu') {
      this.reset();
      return;
    }

    this.audio.unlock();
    const player = playerRacer(state);

    if (state.phase === 'countdown') {
      const sec = Math.ceil(state.countdownMs / 1000);
      if (sec !== this.prevCountdownSec) {
        this.audio.countdownTick(sec);
        this.prevCountdownSec = sec;
      }
    }

    if (state.phase === 'racing' && this.prevPhase === 'countdown') {
      this.audio.raceStart();
    }

    if (state.phase === 'finished' && this.prevPhase === 'racing') {
      this.audio.finish(state.message.includes('WYGRANA') || player.position === 1);
    }

    if (state.phase === 'racing') {
      const boosting = player.boostMs > 0 || player.overchargeMs > 0;
      this.audio.setEngine(player.speed, boosting);
      if (boosting && !this.prevBoost) this.audio.boost();

      const held = player.heldPowerUp?.id ?? '';
      if (held && held !== this.prevHeld) this.audio.pickup();
      this.prevHeld = held;

      if (player.tokensCollected > this.prevTokens) this.audio.token();
      this.prevTokens = player.tokensCollected;

      if (player.checkpointIndex > this.prevCheckpoint) this.audio.checkpoint();
      this.prevCheckpoint = player.checkpointIndex;

      if (this.collisionCooldown > 0) this.collisionCooldown -= dtMs;
      const speedDrop = this.prevSpeed - player.speed;
      if (speedDrop > 80 && player.speed > 40 && this.collisionCooldown <= 0) {
        this.audio.collision();
        this.collisionCooldown = 400;
      }
      this.prevSpeed = player.speed;
    } else {
      this.audio.setEngine(0, false);
    }

    this.prevPhase = state.phase;
    this.prevBoost = player.boostMs > 0 || player.overchargeMs > 0;
  }

  reset(): void {
    this.prevPhase = 'menu';
    this.prevCountdownSec = -1;
    this.prevBoost = false;
    this.prevHeld = '';
    this.prevTokens = 0;
    this.prevCheckpoint = 0;
    this.prevSpeed = 0;
  }
}
