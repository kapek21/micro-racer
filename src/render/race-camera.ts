import { WORLD_H, WORLD_W } from '../core/types.js';

/** Chase camera: close 3/4 view with pitch, damped rotation to reduce motion sickness. */
export class RaceCamera {
  private x = WORLD_W * 0.5;
  private y = WORLD_H * 0.5;
  private zoom = 1;
  private pitch = 0.58;
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

    // Pivot well ahead so the car sits in the lower third (close chase view)
    const look = useChase ? 175 + speed * 0.1 : mode === 'player' ? 80 + speed * 0.08 : 0;
    const targetX = tx + Math.cos(angle) * look;
    const targetY = ty + Math.sin(angle) * look;

    const posSmooth = mode === 'player' ? 6.5 : 4;
    const tPos = 1 - Math.exp(-posSmooth * dt);
    this.x += (targetX - this.x) * tPos;
    this.y += (targetY - this.y) * tPos;

    if (useChase) {
      const targetRot = -angle - Math.PI / 2;
      let diff = targetRot - this.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      // Slower rotation tracking = less head-spin on tight bends
      const rotSmooth = 2.4;
      let tRot = 1 - Math.exp(-rotSmooth * dt);
      const maxStep = 2.2 * dt;
      tRot = Math.min(tRot, maxStep / Math.max(0.001, Math.abs(diff)));
      this.rotation += diff * tRot;
    } else {
      this.rotation += (0 - this.rotation) * tPos * 0.4;
    }

    const targetZoom = useChase
      ? 1.82 + Math.min(speed, 380) * 0.00012
      : mode === 'player'
        ? 1.35 + Math.min(speed, 380) * 0.0001
        : 1;
    const targetPitch = useChase ? 0.58 : 0.72;
    const tZoom = 1 - Math.exp(-5 * dt);
    this.zoom += (targetZoom - this.zoom) * tZoom;
    this.pitch += (targetPitch - this.pitch) * tZoom;

    if (this.shakeMs > 0) {
      this.shakeMs -= dtMs;
      if (this.shakeMs <= 0) this.shakeMag = 0;
    }
  }

  apply(container: {
    pivot: { set(x: number, y: number): void };
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
    container.rotation = this.rotation;
    container.skew.set(0.06, 0);
    container.pivot.set(this.x + ox, this.y + oy);
    container.scale.set(this.zoom, this.zoom * this.pitch);
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
