import { Container, Sprite, type Texture } from 'pixi.js';

export interface SpriteFx {
  alpha?: number;
  tint?: number;
  glow?: { texture: Texture; alpha: number; scale?: number };
}

/** Reusable sprite instances keyed by entity id. */
export class SpritePool {
  private readonly sprites = new Map<string, Sprite>();
  private readonly glows = new Map<string, Sprite>();
  private readonly container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  set(
    id: string,
    texture: Texture,
    x: number,
    y: number,
    rotation: number,
    scale = 1,
    fx?: SpriteFx,
  ): void {
    let sp = this.sprites.get(id);
    if (!sp) {
      sp = new Sprite(texture);
      sp.anchor.set(0.5);
      this.container.addChild(sp);
      this.sprites.set(id, sp);
    }
    sp.texture = texture;
    sp.position.set(x, y);
    sp.rotation = rotation;
    sp.scale.set(scale);
    sp.visible = true;
    sp.alpha = fx?.alpha ?? 1;
    if (fx?.tint !== undefined) sp.tint = fx.tint;

    const glowSpec = fx?.glow;
    let glow = this.glows.get(id);
    if (glowSpec) {
      if (!glow) {
        glow = new Sprite(glowSpec.texture);
        glow.anchor.set(0.5);
        glow.blendMode = 'add';
        this.container.addChildAt(glow, this.container.getChildIndex(sp));
        this.glows.set(id, glow);
      }
      glow.texture = glowSpec.texture;
      glow.position.set(x, y);
      glow.rotation = rotation;
      glow.scale.set(scale * (glowSpec.scale ?? 1.15));
      glow.alpha = glowSpec.alpha;
      glow.visible = true;
    } else if (glow) {
      glow.visible = false;
    }
  }

  hideExcept(active: Set<string>): void {
    for (const [id, sp] of this.sprites) {
      if (!active.has(id)) sp.visible = false;
    }
    for (const [id, glow] of this.glows) {
      if (!active.has(id)) glow.visible = false;
    }
  }

  sortByY(): void {
    const entries = [...this.sprites.entries()].filter(([, s]) => s.visible);
    entries.sort((a, b) => a[1].y - b[1].y);
    for (const [id, sp] of entries) {
      this.container.removeChild(sp);
      this.container.addChild(sp);
      const glow = this.glows.get(id);
      if (glow?.visible) {
        this.container.removeChild(glow);
        this.container.addChildAt(glow, this.container.getChildIndex(sp));
      }
    }
  }
}
