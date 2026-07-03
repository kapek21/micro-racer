import { WORLD_H, WORLD_W } from '../core/types.js';

/**
 * Chase camera: rotates world so the car faces up.
 * Pivot sits slightly ahead of the car (lower-third framing).
 */
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
    this.zoom = 1;
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

    const look = useChase ? 115 + speed * 0.07 : mode === 'player' ? 50 + speed * 0.06 : 0;
    const targetX = tx + Math.cos(angle) * look;
    const targetY = ty + Math.sin(angle) * look;

    const posSmooth = useChase ? 8 : 5;
    const tPos = 1 - Math.exp(-posSmooth * dt);
    this.x += (targetX - this.x) * tPos;
    this.y += (targetY - this.y) * tPos;

    if (useChase) {
      const targetRot = -angle - Math.PI / 2;
      let diff = targetRot - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const rotSmooth = 5.5;
      const tRot = 1 - Math.exp(-rotSmooth * dt);
      this.rotation += diff * tRot;
    } else {
      this.rotation += (0 - this.rotation) * tPos * 0.6;
    }

    const targetZoom = useChase
      ? 1.38 + Math.min(speed, 400) * 0.00018
      : mode === 'player'
        ? 1.12 + Math.min(speed, 400) * 0.00012
        : 1;
    const tZoom = 1 - Math.exp(-6 * dt);
    this.zoom += (targetZoom - this.zoom) * tZoom;

    if (this.shakeMs > 0) {
      this.shakeMs -= dtMs;
      if (this.shakeMs <= 0) this.shakeMag = 0;
    }
  }

  apply(container: {
    pivot: { set(x: number, y: number): void };
    position: { set(x: number, y: number): void };
    scale: { set(x: number, y: number): void };
    skew: { set(x: number, y: number): void };
    rotation: number;
  }): void {
    let ox = 0;
    let oy = 0;
    if (this.shakeMs > 0 && this.shakeMag > 0) {
      const f = this.shakeMs / 280;
      ox = (Math.random() - 0.5) * this.shakeMag * f;
      oy = (Math.random() - 0.5) * this.shakeMag * f;
    }

    container.pivot.set(this.x + ox, this.y + oy);
    container.rotation = this.rotation;
    container.scale.set(this.zoom, this.zoom);
    container.skew.set(0, 0);
    // Slight downward shift — car sits in lower third without skew/distort
    container.position.set(0, 28);
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
