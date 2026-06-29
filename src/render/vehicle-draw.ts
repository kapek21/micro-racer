import type { Graphics } from 'pixi.js';
import type { VehicleConfig } from '../core/types.js';
import type { RacerState } from '../core/types.js';

export function drawVehicle(
  g: Graphics,
  r: RacerState,
  cfg: VehicleConfig,
  steerHint: number,
): void {
  const cos = Math.cos(r.angle);
  const sin = Math.sin(r.angle);
  const rot = (lx: number, ly: number): { x: number; y: number } => ({
    x: r.x + lx * cos - ly * sin,
    y: r.y + lx * sin + ly * cos,
  });

  // Shadow
  g.ellipse(r.x + 3, r.y + 5, 16, 10).fill({ color: 0x000000, alpha: 0.35 });

  const wheelAngle = steerHint * 0.45;
  for (const [wx, wy] of [
    [-8, -9],
    [8, -9],
    [-8, 9],
    [8, 9],
  ] as const) {
    const w = rot(wx, wy);
    g.circle(w.x, w.y, 4.5).fill(0x1a1a1a);
    g.circle(w.x, w.y, 2.5).fill(0x404050);
    const tread = rot(wx + Math.cos(wheelAngle) * 2, wy + Math.sin(wheelAngle) * 2);
    g.moveTo(w.x, w.y);
    g.lineTo(tread.x, tread.y);
    g.stroke({ color: 0x606070, width: 1, alpha: 0.6 });
  }

  // Body — class-specific silhouette
  if (cfg.class === 'heavy') {
    const body = [rot(-14, -8), rot(14, -8), rot(14, 8), rot(-14, 8)];
    g.poly(body.flatMap((p) => [p.x, p.y])).fill(cfg.color);
    g.poly(body.flatMap((p) => [p.x, p.y])).stroke({ color: cfg.accent, width: 2, alpha: 0.8 });
  } else if (cfg.class === 'speed') {
    const body = [rot(-12, -5), rot(6, -7), rot(18, 0), rot(6, 7), rot(-12, 5)];
    g.poly(body.flatMap((p) => [p.x, p.y])).fill(cfg.color);
    g.poly(body.flatMap((p) => [p.x, p.y])).stroke({ color: cfg.accent, width: 1.5, alpha: 0.85 });
  } else if (cfg.class === 'agile') {
    const body = [rot(-10, -7), rot(12, -6), rot(14, 0), rot(12, 6), rot(-10, 7)];
    g.poly(body.flatMap((p) => [p.x, p.y])).fill(cfg.color);
    g.poly(body.flatMap((p) => [p.x, p.y])).stroke({ color: cfg.accent, width: 1.5, alpha: 0.85 });
  } else {
    const body = [rot(-11, -7), rot(11, -7), rot(13, 0), rot(11, 7), rot(-11, 7)];
    g.poly(body.flatMap((p) => [p.x, p.y])).fill(cfg.color);
    g.poly(body.flatMap((p) => [p.x, p.y])).stroke({ color: cfg.accent, width: 1.5, alpha: 0.85 });
  }

  // Cabin window
  const win = [rot(0, -4), rot(8, -3), rot(8, 3), rot(0, 4)];
  g.poly(win.flatMap((p) => [p.x, p.y])).fill({ color: 0xa0e8ff, alpha: 0.75 });

  // Headlights
  const hl1 = rot(14, -4);
  const hl2 = rot(14, 4);
  g.circle(hl1.x, hl1.y, 2).fill(0xffffcc);
  g.circle(hl2.x, hl2.y, 2).fill(0xffffcc);

  if (r.isPlayer) {
    g.circle(r.x, r.y, 24).stroke({ color: 0xffffff, width: 2, alpha: 0.55 });
    g.circle(r.x, r.y, 28).stroke({ color: cfg.color, width: 1, alpha: 0.35 });
  }
}

export function drawVehicleFx(g: Graphics, r: RacerState, steerHint: number): void {
  const cos = Math.cos(r.angle);
  const sin = Math.sin(r.angle);
  const rot = (lx: number, ly: number) => ({
    x: r.x + lx * cos - ly * sin,
    y: r.y + lx * sin + ly * cos,
  });

  if (r.shieldMs > 0) {
    g.circle(r.x, r.y, 26).stroke({ color: 0x80ffff, width: 3, alpha: 0.65 });
    g.circle(r.x, r.y, 22).fill({ color: 0x40c0ff, alpha: 0.08 });
  }
  if (r.jamBlockerMs > 0) {
    g.circle(r.x, r.y, 28).stroke({ color: 0x80ff80, width: 1.5, alpha: 0.5 });
  }
  if (r.cameraCloakMs > 0) {
    g.circle(r.x, r.y, 22).stroke({ color: 0xa040ff, width: 2, alpha: 0.45 });
  }

  const boostActive = r.boostMs > 0 || r.overchargeMs > 0;
  if (boostActive) {
    for (let i = 0; i < 3; i++) {
      const tail = rot(-22 - i * 8, (i - 1) * 4);
      const mid = rot(-12 - i * 6, (i - 1) * 3);
      g.moveTo(mid.x, mid.y);
      g.lineTo(tail.x, tail.y);
      g.stroke({
        color: r.overchargeMs > 0 ? 0xff4040 : 0xff9040,
        width: 5 - i,
        alpha: 0.75 - i * 0.15,
      });
    }
  }

  if (Math.abs(steerHint) > 0.5 && r.speed > 120) {
    const sx = rot(-10, steerHint > 0 ? 10 : -10);
    g.circle(sx.x, sx.y, 3).fill({ color: 0x8898a8, alpha: 0.4 });
  }
}
