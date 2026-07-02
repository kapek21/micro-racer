import type { Graphics } from 'pixi.js';
import type { RacerState } from '../core/types.js';
import { powerUpVisual } from '../config/powerup-visuals.js';

export function drawVehicleFx(
  g: Graphics,
  r: RacerState,
  steerHint: number,
  all: RacerState[],
  t: number,
): void {
  const cos = Math.cos(r.angle);
  const sin = Math.sin(r.angle);
  const rot = (lx: number, ly: number) => ({
    x: r.x + lx * cos - ly * sin,
    y: r.y + lx * sin + ly * cos,
  });

  const pulse = 0.5 + 0.5 * Math.sin(t * 0.008);

  // Headlight beams
  if (r.speed > 60) {
    const beamAlpha = Math.min(0.35, r.speed / 600);
    for (const side of [-1, 1]) {
      const origin = rot(16, side * 5);
      const tip = rot(90 + r.speed * 0.08, side * 28);
      g.moveTo(origin.x, origin.y);
      g.lineTo(tip.x, tip.y);
      g.lineTo(rot(70, side * 18).x, rot(70, side * 18).y);
      g.closePath();
      g.fill({ color: 0xffffcc, alpha: beamAlpha * 0.25 });
    }
  }

  if (r.shieldMs > 0) {
    g.circle(r.x, r.y, 28 + pulse * 3).stroke({ color: 0x80ffff, width: 3, alpha: 0.7 });
    g.circle(r.x, r.y, 22).fill({ color: 0x40c0ff, alpha: 0.1 });
    g.circle(r.x, r.y, 32 + pulse * 4).stroke({ color: 0xffffff, width: 1, alpha: 0.2 });
  }
  if (r.jamBlockerMs > 0) {
    g.circle(r.x, r.y, 30).stroke({ color: 0x80ff80, width: 2, alpha: 0.55 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t * 0.003;
      g.moveTo(r.x, r.y);
      g.lineTo(r.x + Math.cos(a) * 26, r.y + Math.sin(a) * 26);
      g.stroke({ color: 0x40ff60, width: 1, alpha: 0.35 });
    }
  }
  if (r.cameraCloakMs > 0) {
    g.circle(r.x, r.y, 24).stroke({ color: 0xa040ff, width: 2, alpha: 0.5 });
    g.circle(r.x, r.y, 18).fill({ color: 0xa040ff, alpha: 0.08 + pulse * 0.06 });
  }
  if (r.gripMs > 0) {
    g.circle(r.x, r.y, 20).stroke({ color: 0xffd040, width: 1.5, alpha: 0.45 });
  }
  if (r.magnetMs > 0) {
    g.circle(r.x, r.y, 90).stroke({ color: 0xff60c0, width: 1, alpha: 0.25 + pulse * 0.15 });
    g.circle(r.x, r.y, 60).stroke({ color: 0xffa0e0, width: 1, alpha: 0.15 });
  }
  if (r.gateHackMs > 0) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + t * 0.005;
      const px = r.x + Math.cos(a) * 20;
      const py = r.y + Math.sin(a) * 20;
      g.rect(px - 3, py - 3, 6, 6).fill({ color: 0xff40ff, alpha: 0.7 });
    }
  }
  if (r.chargeLinkMs > 0) {
    g.circle(r.x, r.y, 18).stroke({ color: 0xffa030, width: 2, alpha: 0.5 + pulse * 0.3 });
  }

  const boostActive = r.boostMs > 0 || r.overchargeMs > 0;
  if (boostActive) {
    const col = r.overchargeMs > 0 ? 0xff4040 : 0xff9040;
    for (let i = 0; i < 4; i++) {
      const tail = rot(-24 - i * 10, (i - 1.5) * 5);
      const mid = rot(-14 - i * 7, (i - 1.5) * 4);
      g.moveTo(mid.x, mid.y);
      g.lineTo(tail.x, tail.y);
      g.stroke({ color: col, width: 6 - i, alpha: 0.8 - i * 0.15 });
    }
  }

  if (r.droneZapTargetId && r.droneZapTimerMs > 0) {
    const target = all.find((x) => x.id === r.droneZapTargetId);
    if (target) {
      g.moveTo(r.x, r.y);
      g.lineTo(target.x, target.y);
      g.stroke({ color: 0xc060ff, width: 2, alpha: 0.6 + pulse * 0.3 });
      g.circle(target.x, target.y, 16).stroke({ color: 0xff4040, width: 2, alpha: pulse * 0.8 });
    }
  }

  if (r.empSlowMs > 0) {
    g.circle(r.x, r.y, 20).stroke({ color: 0x6080ff, width: 2, alpha: 0.5 });
  }

  if (Math.abs(steerHint) > 0.5 && r.speed > 120) {
    const sx = rot(-10, steerHint > 0 ? 10 : -10);
    g.circle(sx.x, sx.y, 4).fill({ color: 0x8898a8, alpha: 0.45 });
  }

  if (r.isPlayer) {
    g.circle(r.x, r.y, 26).stroke({ color: 0xffffff, width: 1.5, alpha: 0.35 + pulse * 0.15 });
  }

  if (r.heldPowerUp) {
    const vis = powerUpVisual(r.heldPowerUp.id);
    g.circle(r.x, r.y - 22, 8).fill({ color: vis.color, alpha: 0.85 });
    g.circle(r.x, r.y - 22, 10).stroke({ color: vis.glow, width: 1, alpha: 0.6 });
  }
}
