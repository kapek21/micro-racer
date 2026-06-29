export class GameLoop {
  private raf = 0;
  private last = 0;
  private acc = 0;

  constructor(
    private readonly fixedDtMs: number,
    private readonly onFixed: (dtMs: number) => void,
    private readonly onRender: () => void,
  ) {}

  start(): void {
    this.last = performance.now();
    const tick = (now: number): void => {
      const frame = Math.min(100, now - this.last);
      this.last = now;
      this.acc += frame;
      while (this.acc >= this.fixedDtMs) {
        this.onFixed(this.fixedDtMs);
        this.acc -= this.fixedDtMs;
      }
      this.onRender();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
  }
}
