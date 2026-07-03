import { WORLD_H, WORLD_W } from '../core/types.js';

/** Chase camera: rotates world so the car faces up, pivot ahead of vehicle. */
export class RaceCamera {
  private x = WORLD_W * 0.5;
  private y = WORLD_H * 0.5;
  private zoom = 1;
  private rotation = 0;
  private shakeMs = 0;
  private shakeMag = 0;
  private chase = true;

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.rotation = 0;
  }

  setChase(enabled: boolean): void {
    this.chase = enabled;
  }

  addShake(magnitude: number, durationMs = 280): void {
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
    const dt = dtMs / 1000;
    const useChase = this.chase && mode === 'player';
    const look = useChase ? 95 + speed * 0.14 : mode === 'player' ? 60 + speed * 0.1 : 0;
    const targetX = tx + Math.cos(angle) * look;
    const targetY = ty + Math.sin(angle) * look;
    const smooth = mode === 'player' ? 9 : 4;
    const t = 1 - Math.exp(-smooth * dt);
    this.x += (targetX - this.x) * t;
    this.y += (targetY - this.y) * t;

    if (useChase) {
      const targetRot = -angle + Math.PI / 2;
      let diff = targetRot - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotation += diff * t;
    } else {
      this.rotation += (0 - this.rotation) * t * 0.5;
    }

    const targetZoom = useChase
      ? 1.12 + Math.min(speed, 420) * 0.00022
      : mode === 'player'
        ? 1.06 + Math.min(speed, 420) * 0.00018
        : 1;
    this.zoom += (targetZoom - this.zoom) * t;

    if (this.shakeMs > 0) {
      this.shakeMs -= dtMs;
      if (this.shakeMs <= 0) this.shakeMag = 0;
    }
  }

  apply(container: {
    pivot: { set(x: number, y: number): void };
    scale: { set(x: number, y: number): void };
    rotation: number;
  }): void {
    let ox = 0;
    let oy = 0;
    if (this.shakeMs > 0 && this.shakeMag > 0) {
      const f = this.shakeMs / 280;
      ox = (Math.random() - 0.5) * this.shakeMag * f;
      oy = (Math.random() - 0.5) * this.shakeMag * f;
    }
    container.rotation = this.rotation;
    container.pivot.set(this.x + ox, this.y + oy);
    container.scale.set(this.zoom, this.zoom);
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
