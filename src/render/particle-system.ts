export type ParticleKind = 'circle' | 'ring' | 'streak';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  kind: ParticleKind;
  grow?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly max = 600;

  private push(p: Particle): void {
    if (this.particles.length >= this.max) this.particles.shift();
    this.particles.push(p);
  }

  emit(
    x: number,
    y: number,
    count: number,
    opts: Partial<Pick<Particle, 'color' | 'size' | 'alpha' | 'kind' | 'grow' | 'vy' | 'vx'>> & {
      speed?: number;
      life?: number;
    },
  ): void {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (opts.speed ?? 80) * (0.4 + Math.random() * 0.6);
      const life = opts.life ?? 400 + Math.random() * 300;
      this.push({
        x,
        y,
        vx: opts.vx ?? Math.cos(ang) * spd,
        vy: opts.vy ?? Math.sin(ang) * spd,
        life,
        maxLife: life,
        size: opts.size ?? 3 + Math.random() * 3,
        color: opts.color ?? 0xff8040,
        alpha: opts.alpha ?? 0.85,
        kind: opts.kind ?? 'circle',
        grow: opts.grow,
      });
    }
  }

  emitExhaust(
    x: number,
    y: number,
    angle: number,
    intensity: number,
    trail: 'default' | 'spark' | 'holo' = 'default',
  ): void {
    const bx = x - Math.cos(angle) * 14;
    const by = y - Math.sin(angle) * 14;
    const count = trail === 'default' ? (intensity > 1.2 ? 4 : 2) : intensity > 1.2 ? 6 : 3;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * (trail === 'holo' ? 1.1 : 0.7);
      const spd = 40 + intensity * 70 + Math.random() * 30;
      const a = angle + Math.PI + spread;
      const life = 180 + Math.random() * 160;
      const boost = intensity > 1.2;
      let color = boost ? 0xff6030 : intensity > 0.6 ? 0x60d0ff : 0x8898a8;
      if (trail === 'spark') color = boost ? 0xffd040 : 0xffc060;
      if (trail === 'holo') color = boost ? 0xff40ff : 0x40ffe0;
      this.push({
        x: bx,
        y: by,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life,
        maxLife: life,
        size: 2 + intensity * 3.5 + (trail === 'spark' ? 1 : 0),
        color,
        alpha: trail === 'holo' ? 0.9 : 0.75,
        kind: boost || trail !== 'default' ? 'streak' : 'circle',
      });
    }
  }

  emitSkid(x: number, y: number): void {
    if (Math.random() > 0.4) return;
    const life = 1100;
    this.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life,
      maxLife: life,
      size: 5 + Math.random() * 5,
      color: 0x2a3040,
      alpha: 0.4,
      kind: 'circle',
    });
  }

  emitRing(x: number, y: number, color: number, maxRadius = 80): void {
    const life = 500;
    this.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life,
      maxLife: life,
      size: 8,
      color,
      alpha: 0.7,
      kind: 'ring',
      grow: maxRadius / life,
    });
  }

  emitBurst(x: number, y: number, color: number, count = 16, speed = 140): void {
    this.emit(x, y, count, { color, speed, life: 450, size: 4, alpha: 0.9 });
    this.emitRing(x, y, color, 60);
  }

  emitSparkLine(x1: number, y1: number, x2: number, y2: number, color: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const life = 200 + Math.random() * 150;
      this.push({
        x: x1 + dx * t,
        y: y1 + dy * t,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        life,
        maxLife: life,
        size: 2 + Math.random() * 2,
        color,
        alpha: 0.85,
        kind: 'streak',
      });
    }
  }

  emitPickupCollect(x: number, y: number, color: number): void {
    this.emitBurst(x, y, color, 12, 100);
    for (let i = 0; i < 3; i++) {
      this.emitRing(x, y, color, 40 + i * 20);
    }
  }

  tick(dtMs: number): void {
    const dt = dtMs / 1000;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= dtMs;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind !== 'ring') {
        p.vx *= 0.96;
        p.vy *= 0.96;
      }
      if (p.grow) p.size += p.grow * dtMs;
    }
  }

  all(): readonly Particle[] {
    return this.particles;
  }
}
