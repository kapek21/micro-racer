import { Application, Container } from 'pixi.js';
import { WORLD_H, WORLD_W } from '../core/types.js';

export class PixiApp {
  stage!: Container;
  viewport!: Container;
  camera!: Container;
  /** @deprecated use camera */
  world!: Container;
  private app: Application | null = null;
  private host: HTMLElement | null = null;
  private baseScale = 1;
  private ready = false;

  async init(host: HTMLElement): Promise<void> {
    this.host = host;
    this.app = new Application();
    const w = Math.max(host.clientWidth, 320);
    const h = Math.max(host.clientHeight, 240);
    await this.app.init({
      background: 0x1a1208,
      width: w,
      height: h,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    if (!this.host) {
      try {
        this.app.destroy(true);
      } catch {
        /* ignore */
      }
      this.app = null;
      return;
    }
    const canvas = this.app.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    host.style.position = host.style.position || 'relative';
    host.appendChild(canvas);
    this.stage = this.app.stage;

    this.viewport = new Container();
    this.camera = new Container();
    this.viewport.addChild(this.camera);
    this.stage.addChild(this.viewport);
    this.world = this.camera;
    this.ready = true;
    this.resize();
  }

  resize(): void {
    if (!this.host || !this.app || !this.ready) return;
    const w = Math.max(this.host.clientWidth, 1);
    const h = Math.max(this.host.clientHeight, 1);
    this.app.renderer.resize(w, h);
    this.baseScale = Math.min(w / WORLD_W, h / WORLD_H) * 0.98;
    this.applyViewportTransform();
  }

  /** Letterbox the 1200×800 world centered in the host. */
  applyViewportTransform(): void {
    if (!this.host || !this.ready || !this.viewport) return;
    const w = Math.max(this.host.clientWidth, 1);
    const h = Math.max(this.host.clientHeight, 1);
    // Keep scale in sync even if called without resize (e.g. every frame).
    this.baseScale = Math.min(w / WORLD_W, h / WORLD_H) * 0.98;
    this.viewport.scale.set(this.baseScale);
    // Camera pivot is the look-at world point → place that point at screen center.
    this.viewport.position.set(w * 0.5, h * 0.5);
  }

  getBaseScale(): number {
    return this.baseScale;
  }

  destroy(): void {
    this.ready = false;
    this.host = null;
    const app = this.app;
    this.app = null;
    if (!app) return;
    try {
      app.destroy(true);
    } catch {
      /* Pixi resize teardown can throw under StrictMode remount */
    }
  }
}
