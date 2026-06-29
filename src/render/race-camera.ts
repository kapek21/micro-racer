import { WORLD_H, WORLD_W } from '../core/types.js';

/** Smooth follow camera with velocity look-ahead. */
export class RaceCamera {
  private x = WORLD_W * 0.5;
  private y = WORLD_H * 0.5;
  private zoom = 1;

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
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
    const look = mode === 'player' ? 55 + speed * 0.08 : 0;
    const targetX = tx + Math.cos(angle) * look;
    const targetY = ty + Math.sin(angle) * look;
    const smooth = mode === 'player' ? 7.5 : 4;
    const t = 1 - Math.exp(-smooth * dt);
    this.x += (targetX - this.x) * t;
    this.y += (targetY - this.y) * t;

    const targetZoom = mode === 'player' ? 1.04 + Math.min(speed, 400) * 0.00015 : 1;
    this.zoom += (targetZoom - this.zoom) * t;
  }

  apply(container: { pivot: { set(x: number, y: number): void }; scale: { set(x: number, y: number): void } }): void {
    container.pivot.set(this.x, this.y);
    container.scale.set(this.zoom, this.zoom);
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
