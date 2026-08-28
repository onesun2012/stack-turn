export type FrameCallback = (dt: number) => void;

const MAX_DT = 1 / 30;

/**
 * rAF 主循环。dt 单位为秒，已钳制：
 * 切后台时 rAF 暂停，返回瞬间 dt 会异常大，不钳制会导致滑块瞬移。
 */
export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private running = false;

  constructor(private readonly onFrame: FrameCallback) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, MAX_DT);
      this.lastTime = now;
      this.onFrame(dt);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }
}