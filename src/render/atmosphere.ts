import type { Graphics } from 'pixi.js';
import type { TrackDef } from '../core/types.js';
import type { ParticleSystem } from './particle-system.js';

/** Ambient biome overlays + drifting particles. */
export function drawAtmosphere(g: Graphics, track: TrackDef, t: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.002);

  // Vignette
  g.rect(0, 0, 1200, 800).fill({ color: 0x000000, alpha: 0.18 });
  g.rect(80, 60, 1040, 680).fill({ color: track.accentColor, alpha: 0.03 + pulse * 0.02 });

  switch (track.biome) {
    case 'roof':
      for (let i = 0; i < 8; i++) {
        const y = 120 + i * 70 + Math.sin(t * 0.001 + i) * 12;
        g.moveTo(0, y);
        g.lineTo(1200, y + 20);
        g.stroke({ color: 0xffc040, width: 1, alpha: 0.04 + pulse * 0.03 });
      }
      break;
    case 'garden':
      for (let i = 0; i < 20; i++) {
        const x = (i * 137 + t * 0.02) % 1200;
        const y = (i * 89 + t * 0.015) % 800;
        g.circle(x, y, 2 + (i % 3)).fill({ color: 0x80ff80, alpha: 0.12 });
      }
      break;
    case 'security':
      for (let y = 0; y < 800; y += 24) {
        g.moveTo(0, y + (t * 0.04) % 24);
        g.lineTo(1200, y + (t * 0.04) % 24);
        g.stroke({ color: 0xff4080, width: 1, alpha: 0.06 });
      }
      break;
    case 'city':
      for (let i = 0; i < 14; i++) {
        const x = 90 + i * 78;
        const h = 40 + (i % 4) * 22;
        const flicker = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.003 + i * 1.7));
        g.rect(x, 700 - h, 6, 6).fill({ color: 0xffd040, alpha: flicker * 0.5 });
      }
      break;
    case 'living':
      g.roundRect(360, 260, 480, 280, 24).stroke({ color: 0xff40ff, width: 2, alpha: 0.08 + pulse * 0.06 });
      break;
    case 'warehouse':
      for (let i = 0; i < 6; i++) {
        g.rect(100 + i * 180, 100, 2, 600).fill({ color: 0x6080a0, alpha: 0.05 });
      }
      break;
    case 'desk':
      for (let i = 0; i < 12; i++) {
        const x = (i * 100 + t * 0.03) % 1200;
        g.circle(x, 720, 1.5).fill({ color: 0xa0b0ff, alpha: 0.2 });
      }
      break;
    case 'balcony':
      for (let i = 0; i < 5; i++) {
        const dx = Math.sin(t * 0.0015 + i) * 30;
        g.moveTo(200 + i * 200, 0);
        g.lineTo(220 + i * 200 + dx, 800);
        g.stroke({ color: 0xc0e0ff, width: 1, alpha: 0.05 });
      }
      break;
    case 'kitchen':
      g.roundRect(420, 280, 360, 200, 20).fill({ color: 0x40c0ff, alpha: 0.04 + pulse * 0.03 });
      break;
    case 'garage':
      g.roundRect(160, 130, 880, 540, 16).stroke({ color: 0xffa030, width: 3, alpha: 0.1 + pulse * 0.05 });
      break;
    default:
      break;
  }
}

export function tickAtmosphereParticles(system: ParticleSystem, track: TrackDef, t: number): void {
  if (Math.random() > 0.35) return;
  switch (track.biome) {
    case 'garden':
      system.emit(Math.random() * 1200, Math.random() * 800, 1, {
        color: 0x90ff90,
        size: 2,
        speed: 8,
        life: 2000,
        alpha: 0.35,
        vy: -12,
      });
      break;
    case 'roof':
      system.emit(Math.random() * 1200, 100 + Math.random() * 200, 1, {
        color: 0xffe080,
        size: 3,
        speed: 20,
        life: 800,
        alpha: 0.25,
      });
      break;
    case 'security':
      if (Math.floor(t / 200) % 3 === 0) {
        system.emit(Math.random() * 1200, Math.random() * 800, 1, {
          color: 0xff4080,
          size: 1.5,
          speed: 5,
          life: 400,
          alpha: 0.5,
        });
      }
      break;
    case 'city':
      system.emit(Math.random() * 1200, 650 + Math.random() * 100, 1, {
        color: 0xffd040,
        size: 2,
        speed: 4,
        life: 1500,
        alpha: 0.4,
        vy: -6,
      });
      break;
    default:
      break;
  }
}
