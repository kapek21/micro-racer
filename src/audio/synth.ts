/** Low-level Web Audio synthesis helpers. */

export class AudioContextHolder {
  private ctx: AudioContext | null = null;

  get context(): AudioContext | null {
    return this.ctx;
  }

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    void this.ctx.resume();
  }

  destroy(): void {
    void this.ctx?.close();
    this.ctx = null;
  }
}

export function playTone(
  ctx: AudioContext,
  freq: number,
  durationMs: number,
  type: OscillatorType = 'square',
  gain = 0.08,
  when = 0,
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
  g.gain.setValueAtTime(gain, ctx.currentTime + when);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + durationMs / 1000);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + durationMs / 1000 + 0.05);
}

export function playNoiseBurst(ctx: AudioContext, durationMs: number, gain = 0.06): void {
  const bufferSize = ctx.sampleRate * (durationMs / 1000);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0)!;
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  src.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  src.start();
}

export function playSweep(ctx: AudioContext, f0: number, f1: number, durationMs: number, gain = 0.07): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(f0, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), ctx.currentTime + durationMs / 1000);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000 + 0.05);
}
