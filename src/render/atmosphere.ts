import type { Graphics } from 'pixi.js';
import type { TrackDef } from '../core/types.js';
import type { ParticleSystem } from './particle-system.js';
import { tableTheme } from '../config/table-themes.js';

/** Warm pool-hall lighting + subtle dust — no neon sci-fi overlays. */
export function drawAtmosphere(g: Graphics, track: TrackDef, t: number): void {
  const theme = tableTheme(track.biome);
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.0012);

  // Soft vignette (lighter than before — we're in a lit room)
  g.rect(0, 0, 1200, 800).fill({ color: 0x000000, alpha: 0.08 });
  g.circle(600, 360, 520).fill({ color: 0x000000, alpha: 0.06 });
  g.circle(600, 360, 620).fill({ color: 0x000000, alpha: 0.04 });

  // Lamp cone from above
  g.circle(600, 280, 340).fill({ color: theme.lampColor, alpha: 0.05 + pulse * 0.025 });
  g.circle(600, 320, 200).fill({ color: 0xffffff, alpha: 0.025 + pulse * 0.015 });

  // Slow dust motes in light beam (static graphics, particles handle motion)
  for (let i = 0; i < 16; i++) {
    const x = 380 + (i * 53 + t * 0.008) % 440;
    const y = 180 + (i * 37 + t * 0.005) % 360;
    g.circle(x, y, 1 + (i % 2)).fill({ color: 0xfff8e0, alpha: 0.08 + pulse * 0.05 });
  }

  switch (track.biome) {
    case 'city':
      // Brass pocket trim glint
      for (const [px, py] of [
        [52, 52],
        [1148, 52],
        [52, 748],
        [1148, 748],
      ] as [number, number][]) {
        g.circle(px, py, 6).fill({ color: 0xffd060, alpha: 0.15 + pulse * 0.1 });
      }
      break;
    case 'kitchen':
      g.roundRect(400, 260, 400, 220, 16).fill({ color: 0xffffff, alpha: 0.03 });
      break;
    case 'living':
      g.roundRect(360, 250, 480, 290, 20).fill({ color: 0xffe0c0, alpha: 0.04 + pulse * 0.02 });
      break;
    case 'desk':
      g.circle(920, 250, 60).fill({ color: 0xffffd0, alpha: 0.06 + pulse * 0.04 });
      break;
    default:
      break;
  }
}

export function tickAtmosphereParticles(system: ParticleSystem, track: TrackDef, _t: number): void {
  if (Math.random() > 0.55) return;
  const theme = tableTheme(track.biome);
  switch (track.biome) {
    case 'garden':
      system.emit(200 + Math.random() * 800, 100 + Math.random() * 500, 1, {
        color: 0xc0ffb0,
        size: 1.5,
        speed: 4,
        life: 2500,
        alpha: 0.2,
        vy: -8,
      });
      break;
    case 'city':
      system.emit(400 + Math.random() * 400, 200 + Math.random() * 300, 1, {
        color: 0xfff8d0,
        size: 1.2,
        speed: 3,
        life: 3000,
        alpha: 0.25,
        vy: -5,
      });
      break;
    default:
      if (Math.random() > 0.7) {
        system.emit(300 + Math.random() * 600, 150 + Math.random() * 400, 1, {
          color: theme.lampColor,
          size: 1,
          speed: 2,
          life: 2000,
          alpha: 0.18,
          vy: -4,
        });
      }
      break;
  }
}
