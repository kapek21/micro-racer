import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { RaceState, RacerState, TrackDef } from '../core/types.js';
import { vehicleById } from '../config/vehicles.js';
import { getLateralSpeed } from '../physics/vehicle-controller.js';
import { getTrackSamples } from '../race/race-sim.js';
import { powerUpVisual, rarityGlowScale, rarityPulse } from '../config/powerup-visuals.js';
import type { SpriteAtlas } from './sprite-atlas.js';
import { loadSpriteAtlas } from './asset-loader.js';
import { ParticleSystem } from './particle-system.js';
import { RaceCamera } from './race-camera.js';
import { syncBiomeDecorations } from './biome-decorations.js';
import { drawAtmosphere, tickAtmosphereParticles } from './atmosphere.js';
import { drawBiome, drawTrack } from './track-draw.js';
import { drawVehicleFx } from './vehicle-draw.js';
import { SpritePool } from './sprite-pool.js';
import { hasTablePhotoPngs, tablePhotoTexture } from './table-photo.js';
import type { PixiApp } from './pixi-app.js';

const VEHICLE_SCALE = 0.72;
const HAZARD_SCALE = 0.68;
const PICKUP_SCALE = 0.62;
const TOKEN_SCALE = 0.58;
const MINE_SCALE = 0.55;
const PAD_SCALE = 0.95;

export class RaceRenderer {
  private readonly layers: {
    bg: Graphics;
    track: Graphics;
    decals: Graphics;
    fx: Graphics;
    particles: Graphics;
    atmosphere: Graphics;
  };
  private readonly biomeLayer: Container;
  private readonly spriteLayer: Container;
  private readonly tablePhoto: Sprite;
  private tableBiome = '';
  private readonly biomeDecos: SpritePool;
  private readonly shadows: SpritePool;
  private readonly entities: SpritePool;
  private readonly labels: Container;
  private readonly atlas: SpriteAtlas;
  private readonly particles = new ParticleSystem();
  private readonly camera = new RaceCamera();
  private readonly pixi: PixiApp;
  private t = 0;
  private prevActivePickups = new Set<string>();
  private prevPlayerSpeed = 0;
  private prevPlayerEmpSlow = 0;
  private playerTrail: 'default' | 'spark' | 'holo' = 'default';

  private constructor(pixi: PixiApp, atlas: SpriteAtlas) {
    this.pixi = pixi;
    this.atlas = atlas;
    this.layers = {
      bg: new Graphics(),
      track: new Graphics(),
      decals: new Graphics(),
      fx: new Graphics(),
      particles: new Graphics(),
      atmosphere: new Graphics(),
    };
    this.biomeLayer = new Container();
    this.spriteLayer = new Container();
    this.tablePhoto = new Sprite();
    this.tablePhoto.width = 1200;
    this.tablePhoto.height = 800;
    this.tablePhoto.alpha = 0.92;
    this.biomeDecos = new SpritePool(this.biomeLayer);
    this.shadows = new SpritePool(this.spriteLayer);
    this.entities = new SpritePool(this.spriteLayer);
    this.labels = new Container();

    pixi.camera.addChild(this.tablePhoto);
    pixi.camera.addChild(this.layers.bg);
    pixi.camera.addChild(this.biomeLayer);
    pixi.camera.addChild(this.layers.track);
    pixi.camera.addChild(this.spriteLayer);
    pixi.camera.addChild(this.layers.decals);
    pixi.camera.addChild(this.layers.fx);
    pixi.camera.addChild(this.layers.particles);
    pixi.camera.addChild(this.layers.atmosphere);
    pixi.camera.addChild(this.labels);
  }

  static async create(pixi: PixiApp): Promise<RaceRenderer> {
    const atlas = await loadSpriteAtlas();
    return new RaceRenderer(pixi, atlas);
  }

  setPlayerTrail(trailId: string | null): void {
    if (trailId === 'trail_spark') this.playerTrail = 'spark';
    else if (trailId === 'trail_holo') this.playerTrail = 'holo';
    else this.playerTrail = 'default';
  }

  sync(state: RaceState, track: TrackDef, dtMs: number): void {
    this.t += dtMs;
    this.particles.tick(dtMs);
    tickAtmosphereParticles(this.particles, track, this.t);

    const player = state.racers.find((r) => r.isPlayer);
    const follow = player;
    if (follow) {
      this.camera.follow(follow.x, follow.y, follow.angle, follow.speed, dtMs, 'player');
    }

    if (player) {
      if (player.empSlowMs > this.prevPlayerEmpSlow + 200) {
        this.camera.addShake(5, 320);
      }
      if (
        this.prevPlayerSpeed > 180 &&
        player.speed < this.prevPlayerSpeed - 90 &&
        player.shieldMs <= 0
      ) {
        this.camera.addShake(4, 260);
      }
      this.prevPlayerEmpSlow = player.empSlowMs;
      this.prevPlayerSpeed = player.speed;
    }

    this.camera.apply(this.pixi.camera);
    this.pixi.applyViewportTransform();

    for (const r of state.racers) {
      if (r.eliminated) continue;
      const intensity = Math.min(1, r.speed / 350) * (r.boostMs > 0 || r.overchargeMs > 0 ? 1.6 : 1);
      if (r.speed > 40) {
        const trail = r.isPlayer ? this.playerTrail : 'default';
        this.particles.emitExhaust(r.x, r.y, r.angle, intensity, trail);
      }
      if (getLateralSpeed(r) > 70 && r.speed > 100) this.particles.emitSkid(r.x, r.y);
    }

    this.detectPickupCollects(state, player);

    this.layers.bg.clear();
    this.layers.track.clear();
    this.layers.decals.clear();
    this.layers.fx.clear();
    this.layers.particles.clear();
    this.layers.atmosphere.clear();
    this.labels.removeChildren();

    const active = new Set<string>();

    if (hasTablePhotoPngs()) {
      if (this.tableBiome !== track.biome) {
        this.tableBiome = track.biome;
        this.tablePhoto.texture = tablePhotoTexture(track.biome);
      }
      this.tablePhoto.visible = true;
      // Light tint overlay so neon track still reads on photo
      this.layers.bg.clear();
      this.layers.bg.rect(0, 0, 1200, 800).fill({ color: track.bgColor, alpha: 0.35 });
      this.layers.bg.circle(600, 400, 420).fill({ color: track.accentColor, alpha: 0.06 });
    } else {
      this.tablePhoto.visible = false;
      drawBiome(this.layers.bg, track, this.t);
    }
    syncBiomeDecorations(this.biomeDecos, this.atlas, track, this.t, active);
    drawTrack(this.layers.track, track, getTrackSamples(), this.atlas, this.t);

    drawSlipZones(this.layers.decals, track);
    drawGates(this.layers.decals, track, state);
    drawCameraTraps(this.layers.decals, track, this.t);
    drawFoam(this.layers.decals, state);

    const pulse = 0.5 + 0.5 * Math.sin(this.t * 0.005);
    const pulseFast = 0.5 + 0.5 * Math.sin(this.t * 0.012);

    for (const pad of track.boostPads) {
      const id = `pad_${pad.x}_${pad.y}`;
      const glowId = `${id}_glow`;
      active.add(id);
      active.add(glowId);
      const padPulse = 1 + pulse * 0.1;
      const cx = pad.x + pad.w / 2;
      const cy = pad.y + pad.h / 2;
      this.entities.set(glowId, this.atlas.boostPadGlow, cx, cy, 0, PAD_SCALE * padPulse * 1.08, {
        alpha: 0.45 + pulse * 0.4,
        glow: { texture: this.atlas.glow, alpha: 0.2 + pulse * 0.3, scale: 1.5 },
      });
      this.entities.set(id, this.atlas.boostPad, cx, cy, 0, PAD_SCALE * padPulse);
    }

    for (const tok of state.tokens) {
      if (!tok.active) continue;
      const bob = Math.sin(this.t * 0.006 + tok.x) * 4;
      const spin = this.t * 0.003;
      const shimmer = 0.85 + pulseFast * 0.15;
      const id = `tok_${tok.id}`;
      active.add(id);
      this.entities.set(id, this.atlas.token, tok.x, tok.y + bob, spin, TOKEN_SCALE * shimmer, {
        glow: { texture: this.atlas.glow, alpha: 0.2 + pulse * 0.25, scale: 1.3 },
      });
    }

    for (const m of state.mines) {
      const id = `mine_${m.id}`;
      active.add(id);
      const warn = 0.7 + pulseFast * 0.3;
      this.entities.set(id, this.atlas.mine, m.x, m.y, this.t * 0.001, MINE_SCALE * (1 + pulseFast * 0.06), {
        alpha: warn,
        glow: { texture: this.atlas.glow, alpha: pulseFast * 0.4, scale: 1.1 },
      });
    }

    for (const p of state.pickups) {
      if (!p.active) continue;
      const vis = powerUpVisual(p.powerUpId);
      const bob = Math.sin(this.t * 0.007 + p.x) * 6;
      const rPulse = rarityPulse(vis.rarity, this.t);
      const id = `pick_${p.spawnId}`;
      active.add(id);
      const tex = this.atlas.powerups[p.powerUpId] ?? this.atlas.pickup;
      this.entities.set(
        id,
        tex,
        p.x,
        p.y + bob,
        this.t * 0.004 + p.y * 0.01,
        PICKUP_SCALE * (1 + pulse * 0.08) * rPulse,
        {
          glow: {
            texture: this.atlas.glow,
            alpha: (0.35 + pulse * 0.3) * rPulse,
            scale: rarityGlowScale(vis.rarity),
          },
          tint: vis.color,
        },
      );
    }

    for (const h of state.hazards) {
      const id = `hz_${h.id}`;
      active.add(id);
      let tex = this.atlas.vacuum;
      let scale = HAZARD_SCALE;
      let rot = h.angle;
      let bob = 0;

      if (h.kind === 'robot_mower') {
        tex = this.atlas.mower;
        rot += Math.sin(h.t * 0.02) * 0.15;
      } else if (h.kind === 'drone_drop') {
        tex = this.atlas.drone;
        bob = Math.sin(this.t * 0.008 + h.id.length) * 3;
        rot += Math.sin(this.t * 0.025) * 0.2;
      } else if (h.kind === 'conveyor') {
        tex = this.atlas.conveyor;
        scale = 0.85;
      } else {
        rot += Math.sin(h.t * 0.015) * 0.12;
      }

      this.entities.set(id, tex, h.x, h.y + bob, rot, scale);
    }

    const sorted = [...state.racers].filter((r) => !r.eliminated).sort((a, b) => a.y - b.y);
    for (const r of sorted) {
      const sid = `shadow_${r.id}`;
      active.add(sid);
      const shadowScale = 1 + Math.min(0.15, r.speed / 500);
      this.shadows.set(sid, this.atlas.shadow, r.x + 2, r.y + 8, 0, shadowScale);
    }

    for (const r of sorted) {
      const id = `car_${r.id}`;
      active.add(id);
      const tex = this.atlas.vehicles[r.vehicleId] ?? this.atlas.vehicles['volt_mini_gt']!;
      const cfg = vehicleById(r.vehicleId);
      const lean = Math.sin(r.angle) * 0.04 * Math.min(1, r.speed / 200);
      const boostScale = r.boostMs > 0 || r.overchargeMs > 0 ? 1.04 : 1;
      this.entities.set(id, tex, r.x, r.y, r.angle + Math.PI / 2 + lean, VEHICLE_SCALE * boostScale, {
        tint: this.atlas.vehicles[r.vehicleId] ? 0xffffff : cfg.color,
        glow:
          r.boostMs > 0 || r.overchargeMs > 0
            ? { texture: this.atlas.glow, alpha: 0.45 + pulseFast * 0.2, scale: 1.6 }
            : r.isPlayer
              ? { texture: this.atlas.glow, alpha: 0.12 + pulse * 0.08, scale: 1.35 }
              : undefined,
      });
    }
    this.entities.sortByY();

    for (const r of state.racers) {
      if (r.eliminated) continue;
      drawVehicleFx(this.layers.fx, r, 0, state.racers, this.t);
    }

    drawParticles(this.layers.particles, this.particles);
    drawAtmosphere(this.layers.atmosphere, track, this.t);
    drawLabels(this.labels, state);

    this.biomeDecos.hideExcept(active);
    this.shadows.hideExcept(active);
    this.entities.hideExcept(active);

  }

  private detectPickupCollects(state: RaceState, player: RacerState | undefined): void {
    const current = new Set<string>();
    for (const p of state.pickups) {
      if (p.active) current.add(p.spawnId);
    }
    for (const spawnId of this.prevActivePickups) {
      if (current.has(spawnId)) continue;
      const p = state.pickups.find((x) => x.spawnId === spawnId);
      if (!p || !player) continue;
      const dist = Math.hypot(p.x - player.x, p.y - player.y);
      if (dist < 80) {
        const vis = powerUpVisual(p.powerUpId);
        this.particles.emitPickupCollect(p.x, p.y, vis.color);
        this.camera.addShake(2, 180);
      }
    }
    this.prevActivePickups = current;
  }
}

function drawSlipZones(g: Graphics, track: TrackDef): void {
  for (const z of track.slipZones) {
    g.roundRect(z.x, z.y, z.w, z.h, 8).fill({ color: 0x60c0ff, alpha: 0.22 });
  }
}

function drawGates(g: Graphics, track: TrackDef, state: RaceState): void {
  for (const gate of track.gates) {
    const open = state.gateOpen[gate.id];
    g.rect(gate.x, gate.y, gate.w, gate.h).fill({
      color: open ? 0x40ff80 : 0xff4040,
      alpha: open ? 0.25 : 0.6,
    });
  }
}

function drawCameraTraps(g: Graphics, track: TrackDef, t: number): void {
  for (const cam of track.cameraTraps) {
    const pulse = 0.4 + 0.3 * Math.sin(t * 0.01);
    g.circle(cam.x, cam.y, cam.radius).stroke({ color: 0xff4080, width: 1, alpha: pulse * 0.35 });
  }
}

function drawFoam(g: Graphics, state: RaceState): void {
  for (const f of state.foamPatches) {
    g.circle(f.x, f.y, 26).fill({ color: 0xffffff, alpha: 0.28 });
  }
}

function drawParticles(g: Graphics, system: ParticleSystem): void {
  for (const p of system.all()) {
    const a = p.alpha * (p.life / p.maxLife);
    if (p.kind === 'ring') {
      g.circle(p.x, p.y, p.size).stroke({ color: p.color, width: 2, alpha: a });
    } else if (p.kind === 'streak') {
      g.moveTo(p.x, p.y);
      g.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
      g.stroke({ color: p.color, width: Math.max(1, p.size * 0.5), alpha: a });
    } else {
      g.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: a });
    }
  }
}

function drawLabels(labels: Container, state: RaceState): void {
  for (const r of state.racers) {
    if (r.eliminated) continue;
    const label = new Text({
      text: r.isPlayer ? 'YOU' : `#${r.position}`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 10,
        fill: r.isPlayer ? 0xffffff : 0xc0d0e0,
        dropShadow: { color: 0x000000, blur: 2, distance: 1, alpha: 0.8 },
      },
    });
    label.anchor.set(0.5, 1);
    label.x = r.x;
    label.y = r.y - 30;
    labels.addChild(label);
  }
}
