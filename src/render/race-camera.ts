import { WORLD_H, WORLD_W } from '../core/types.js';

/** Smooth follow camera with velocity look-ahead and impact shake. */
export class RaceCamera {
  private x = WORLD_W * 0.5;
  private y = WORLD_H * 0.5;
  private zoom = 1;
  private shakeMs = 0;
  private shakeMag = 0;
  /** When true, stay locked on world center (studio cover / overview). */
  private overview = false;

  setOverview(enabled: boolean): void {
    this.overview = enabled;
    if (enabled) {
      this.x = WORLD_W * 0.5;
      this.y = WORLD_H * 0.5;
      this.zoom = 1;
      this.shakeMs = 0;
      this.shakeMag = 0;
    }
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  addShake(magnitude: number, durationMs = 280): void {
    if (this.overview) return;
    this.shakeMag = Math.max(this.shakeMag, magnitude);
    this.shakeMs = Math.max(this.shakeMs, durationMs);
  }

  follow(
    tx: number,
    ty: number,
    angle: number,
    speed: number,
    dtMs: number,
    mode: 'player' | 'leader' = 'player',
  ): void {
    if (this.overview) {
      this.x = WORLD_W * 0.5;
      this.y = WORLD_H * 0.5;
      this.zoom = 1;
      return;
    }
    const dt = dtMs / 1000;
    const look = mode === 'player' ? 60 + speed * 0.1 : 0;
    const targetX = tx + Math.cos(angle) * look;
    const targetY = ty + Math.sin(angle) * look;
    const smooth = mode === 'player' ? 8 : 4;
    const t = 1 - Math.exp(-smooth * dt);
    this.x += (targetX - this.x) * t;
    this.y += (targetY - this.y) * t;

    const targetZoom = mode === 'player' ? 1.06 + Math.min(speed, 420) * 0.00018 : 1;
    this.zoom += (targetZoom - this.zoom) * t;

    if (this.shakeMs > 0) {
      this.shakeMs -= dtMs;
      if (this.shakeMs <= 0) this.shakeMag = 0;
    }
  }

  apply(container: {
    pivot: { set(x: number, y: number): void };
    scale: { set(x: number, y: number): void };
  }): void {
    let ox = 0;
    let oy = 0;
    if (!this.overview && this.shakeMs > 0 && this.shakeMag > 0) {
      const f = this.shakeMs / 280;
      ox = (Math.random() - 0.5) * this.shakeMag * f;
      oy = (Math.random() - 0.5) * this.shakeMag * f;
    }
    container.pivot.set(this.x + ox, this.y + oy);
    container.scale.set(this.zoom, this.zoom);
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
