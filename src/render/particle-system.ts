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
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private readonly max = 400;

  emit(x: number, y: number, count: number, opts: Partial<Pick<Particle, 'color' | 'size' | 'alpha'>> & { speed?: number; life?: number }): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.max) this.particles.shift();
      const ang = Math.random() * Math.PI * 2;
      const spd = (opts.speed ?? 80) * (0.4 + Math.random() * 0.6);
      const life = opts.life ?? 400 + Math.random() * 300;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life,
        maxLife: life,
        size: opts.size ?? 3 + Math.random() * 3,
        color: opts.color ?? 0xff8040,
        alpha: opts.alpha ?? 0.85,
      });
    }
  }

  emitExhaust(x: number, y: number, angle: number, intensity: number): void {
    const bx = x - Math.cos(angle) * 14;
    const by = y - Math.sin(angle) * 14;
    for (let i = 0; i < 2; i++) {
      if (this.particles.length >= this.max) this.particles.shift();
      const spread = (Math.random() - 0.5) * 0.7;
      const spd = 40 + intensity * 60 + Math.random() * 30;
      const a = angle + Math.PI + spread;
      const life = 180 + Math.random() * 120;
      this.particles.push({
        x: bx,
        y: by,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life,
        maxLife: life,
        size: 2 + intensity * 3,
        color: intensity > 0.6 ? 0x60d0ff : 0x8898a8,
        alpha: 0.7,
      });
    }
  }

  emitSkid(x: number, y: number): void {
    if (Math.random() > 0.45) return;
    if (this.particles.length >= this.max) this.particles.shift();
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 900,
      maxLife: 900,
      size: 5 + Math.random() * 4,
      color: 0x2a3040,
      alpha: 0.35,
    });
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
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
  }

  all(): readonly Particle[] {
    return this.particles;
  }
}
