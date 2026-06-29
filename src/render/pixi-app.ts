import { Application, Container } from 'pixi.js';
import { WORLD_H, WORLD_W } from '../core/types.js';

export class PixiApp {
  stage!: Container;
  world!: Container;
  private app!: Application;
  private host: HTMLElement | null = null;

  async init(host: HTMLElement): Promise<void> {
    this.host = host;
    this.app = new Application();
    await this.app.init({
      background: 0x0a1020,
      resizeTo: host,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    host.appendChild(this.app.canvas);
    this.stage = this.app.stage;
    this.world = new Container();
    this.stage.addChild(this.world);
  }

  resize(): void {
    if (!this.host) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    const scale = Math.min(w / WORLD_W, h / WORLD_H) * 0.96;
    this.world.scale.set(scale);
    this.world.x = (w - WORLD_W * scale) / 2;
    this.world.y = (h - WORLD_H * scale) / 2;
  }

  destroy(): void {
    this.app?.destroy(true);
  }
}
