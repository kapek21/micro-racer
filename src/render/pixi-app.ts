import { Application, Container } from 'pixi.js';
import { WORLD_H, WORLD_W } from '../core/types.js';

export class PixiApp {
  stage!: Container;
  viewport!: Container;
  camera!: Container;
  /** @deprecated use camera */
  world!: Container;
  private app!: Application;
  private host: HTMLElement | null = null;
  private baseScale = 1;

  async init(host: HTMLElement): Promise<void> {
    this.host = host;
    this.app = new Application();
    await this.app.init({
      background: 0x1a1208,
      resizeTo: host,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    host.appendChild(this.app.canvas);
    this.stage = this.app.stage;

    this.viewport = new Container();
    this.camera = new Container();
    this.viewport.addChild(this.camera);
    this.stage.addChild(this.viewport);
    this.world = this.camera;
  }

  resize(): void {
    if (!this.host) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    this.baseScale = Math.min(w / WORLD_W, h / WORLD_H) * 1.04;
    this.applyViewportTransform();
  }

  applyViewportTransform(): void {
    if (!this.host) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    this.viewport.scale.set(this.baseScale);
    this.viewport.x = w * 0.5;
    this.viewport.y = h * 0.5;
  }

  getBaseScale(): number {
    return this.baseScale;
  }

  destroy(): void {
    this.app?.destroy(true);
  }
}
