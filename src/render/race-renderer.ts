import { Container, Graphics, Text } from 'pixi.js';
import type { RaceState, TrackDef } from '../core/types.js';
import { vehicleById } from '../config/vehicles.js';
import { getTrackSamples } from '../race/race-sim.js';
import { leaderRacer } from '../race/mode-logic.js';

export class RaceRenderer {
  private readonly g: Graphics;
  private readonly labels: Container;
  private t = 0;

  constructor(world: Container) {
    this.g = new Graphics();
    this.labels = new Container();
    world.addChild(this.g);
    world.addChild(this.labels);
  }

  sync(state: RaceState, track: TrackDef, dtMs: number): void {
    this.t += dtMs;
    this.g.clear();
    this.labels.removeChildren();

    drawBiomeBg(this.g, track);
    drawTrackSurface(this.g, track);
    drawSlipZones(this.g, track);
    drawBoostPads(this.g, track);
    drawGates(this.g, track, state);
    drawCameraTraps(this.g, track, this.t);
    drawTokens(this.g, state);
    drawMines(this.g, state);
    drawFoam(this.g, state);
    drawHazards(this.g, state, track, this.t);
    drawPickups(this.g, state);
    drawRacers(this.g, this.labels, state);

    if (state.mode === 'elimination_camera') {
      const leader = leaderRacer(state.racers);
      if (leader) {
        this.g.circle(leader.x, leader.y, 320).stroke({ color: 0xffffff, width: 1, alpha: 0.15 });
      }
    }
  }
}

function drawBiomeBg(g: Graphics, track: TrackDef): void {
  g.rect(0, 0, 1200, 800).fill(track.bgColor);
  g.rect(40, 40, 1120, 720).fill({ color: track.accentColor, alpha: 0.08 });
  g.rect(60, 60, 1080, 680).fill({ color: 0xffffff, alpha: 0.03 });

  if (track.biome === 'kitchen') {
    g.roundRect(460, 320, 280, 160, 16).fill({ color: 0x505868, alpha: 0.9 });
  } else if (track.biome === 'roof') {
    for (let i = 0; i < 6; i++) {
      g.rect(200 + i * 140, 250, 100, 60).fill({ color: 0x304060, alpha: 0.5 });
    }
  } else if (track.biome === 'garden') {
    g.circle(600, 400, 200).fill({ color: 0x208040, alpha: 0.15 });
  } else if (track.biome === 'living') {
    const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.004);
    g.roundRect(400, 300, 400, 200, 20).fill({ color: 0xff40ff, alpha: pulse * 0.15 });
  } else if (track.biome === 'city') {
    for (let i = 0; i < 8; i++) {
      g.rect(150 + i * 120, 500, 40, 80 + (i % 3) * 30).fill({ color: 0x203040, alpha: 0.6 });
    }
  }
}

function drawTrackSurface(g: Graphics, track: TrackDef): void {
  const samples = getTrackSamples();
  const hw = track.trackWidth * 0.5;
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i]!;
    const b = samples[i + 1]!;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    g.moveTo(a.x + nx * hw, a.y + ny * hw);
    g.lineTo(b.x + nx * hw, b.y + ny * hw);
    g.lineTo(b.x - nx * hw, b.y - ny * hw);
    g.lineTo(a.x - nx * hw, a.y - ny * hw);
    g.closePath();
  }
  g.fill({ color: 0x8898a8, alpha: 0.35 });
  g.stroke({ color: track.accentColor, width: 3, alpha: 0.55 });

  const s0 = samples[0]!;
  g.rect(s0.x - 40, s0.y - 8, 80, 16).fill({ color: 0xffffff, alpha: 0.7 });
}

function drawSlipZones(g: Graphics, track: TrackDef): void {
  for (const z of track.slipZones) {
    g.roundRect(z.x, z.y, z.w, z.h, 8).fill({ color: 0x60c0ff, alpha: 0.2 });
  }
}

function drawBoostPads(g: Graphics, track: TrackDef): void {
  for (const pad of track.boostPads) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
    g.roundRect(pad.x, pad.y, pad.w, pad.h, 6).fill({ color: 0xffd040, alpha: 0.25 + pulse * 0.2 });
    g.roundRect(pad.x, pad.y, pad.w, pad.h, 6).stroke({ color: 0xffa020, width: 2, alpha: 0.6 });
  }
}

function drawGates(g: Graphics, track: TrackDef, state: RaceState): void {
  for (const gate of track.gates) {
    const open = state.gateOpen[gate.id];
    g.rect(gate.x, gate.y, gate.w, gate.h).fill({
      color: open ? 0x40ff80 : 0xff4040,
      alpha: open ? 0.2 : 0.55,
    });
  }
}

function drawCameraTraps(g: Graphics, track: TrackDef, t: number): void {
  for (const cam of track.cameraTraps) {
    const pulse = 0.4 + 0.3 * Math.sin(t * 0.01);
    g.circle(cam.x, cam.y, cam.radius).stroke({ color: 0xff4080, width: 1, alpha: pulse * 0.4 });
    g.circle(cam.x, cam.y, 8).fill({ color: 0xff4080, alpha: 0.8 });
  }
}

function drawTokens(g: Graphics, state: RaceState): void {
  for (const t of state.tokens) {
    if (!t.active) continue;
    g.star(t.x, t.y, 5, 8, 4, Date.now() * 0.002).fill({ color: 0xffd040, alpha: 0.9 });
  }
}

function drawMines(g: Graphics, state: RaceState): void {
  for (const m of state.mines) {
    g.circle(m.x, m.y, 8).fill({ color: 0xff2020, alpha: 0.9 });
    g.circle(m.x, m.y, 14).stroke({ color: 0xff8080, width: 1, alpha: 0.5 });
  }
}

function drawFoam(g: Graphics, state: RaceState): void {
  for (const f of state.foamPatches) {
    g.circle(f.x, f.y, 24).fill({ color: 0xffffff, alpha: 0.25 });
  }
}

function drawHazards(g: Graphics, state: RaceState, track: TrackDef, t: number): void {
  for (const h of state.hazards) {
    const def = track.hazards.find((d) => d.id === h.id);
    const pulse = 0.6 + 0.4 * Math.sin(t * 0.012);
    if (h.kind === 'robot_vacuum' || h.kind === 'robot_mower') {
      g.circle(h.x, h.y, 22).fill({ color: 0x304050, alpha: 0.9 });
      g.circle(h.x, h.y, 16).fill({
        color: h.kind === 'robot_mower' ? 0x40e040 : 0x40a0c0,
        alpha: pulse,
      });
    } else if (h.kind === 'drone_drop') {
      g.moveTo(h.x, h.y - 16);
      g.lineTo(h.x + 14, h.y + 10);
      g.lineTo(h.x - 14, h.y + 10);
      g.closePath();
      g.fill({ color: 0x8090ff, alpha: 0.85 });
    } else if (h.kind === 'conveyor') {
      g.rect(h.x - 30, h.y - 12, 60, 24).fill({ color: 0x606880, alpha: 0.7 });
    }
    if (def && h.kind !== 'conveyor') {
      g.moveTo(def.x1, def.y1);
      g.lineTo(def.x2, def.y2);
      g.stroke({ color: 0x40c0ff, width: 1, alpha: 0.2 });
    }
  }
}

function drawPickups(g: Graphics, state: RaceState): void {
  for (const p of state.pickups) {
    if (!p.active) continue;
    const bob = Math.sin(Date.now() * 0.006 + p.x) * 4;
    g.circle(p.x, p.y + bob, 12).fill({ color: 0xff40a0, alpha: 0.85 });
    g.circle(p.x, p.y + bob, 18).stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
  }
}

function drawRacers(g: Graphics, labels: Container, state: RaceState): void {
  for (const r of state.racers) {
    if (r.eliminated) continue;
    const cfg = vehicleById(r.vehicleId);
    const cos = Math.cos(r.angle);
    const sin = Math.sin(r.angle);
    const rot = (lx: number, ly: number): { x: number; y: number } => ({
      x: r.x + lx * cos - ly * sin,
      y: r.y + lx * sin + ly * cos,
    });

    if (r.shieldMs > 0) {
      g.circle(r.x, r.y, 22).stroke({ color: 0x80ffff, width: 3, alpha: 0.7 });
    }
    if (r.jamBlockerMs > 0) {
      g.circle(r.x, r.y, 26).stroke({ color: 0x80ff80, width: 1, alpha: 0.5 });
    }
    if (r.cameraCloakMs > 0) {
      g.circle(r.x, r.y, 20).stroke({ color: 0xa040ff, width: 2, alpha: 0.4 });
    }
    if (r.boostMs > 0 || r.overchargeMs > 0) {
      const tail = rot(-28, 0);
      const mid = rot(-18, 0);
      g.moveTo(mid.x, mid.y);
      g.lineTo(tail.x, tail.y);
      g.stroke({ color: r.overchargeMs > 0 ? 0xff4040 : 0xff8040, width: 4, alpha: 0.7 });
    }

    const body = [rot(-10, -6), rot(10, -6), rot(10, 6), rot(-10, 6)];
    g.poly(body.flatMap((p) => [p.x, p.y])).fill(cfg.color);
    const nose = [rot(10, -4), rot(18, 0), rot(10, 4)];
    g.poly(nose.flatMap((p) => [p.x, p.y])).fill(0xffffff);

    if (r.isPlayer) {
      g.circle(r.x, r.y, 20).stroke({ color: 0xffffff, width: 2, alpha: 0.8 });
    }

    const label = new Text({
      text: r.isPlayer ? 'YOU' : `#${r.position}`,
      style: { fontFamily: 'Orbitron', fontSize: 9, fill: 0xffffff },
    });
    label.anchor.set(0.5, 1);
    label.x = r.x;
    label.y = r.y - 22;
    labels.addChild(label);
  }
}
