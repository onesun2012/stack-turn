import { loadSettings, saveSettings } from '../storage/store';

/** C5 起的大调五声音阶（半音数）：连击越高音越亮，封顶后维持 */
const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_FREQ = 523.25;

export class Synth {
  private ctx: AudioContext | null = null;
  private muted = loadSettings().muted;

  get isMuted(): boolean {
    return this.muted;
  }

  toggleMuted(): boolean {
    this.muted = !this.muted;
    saveSettings({ muted: this.muted });
    return this.muted;
  }

  /** 移动端自动播放策略：AudioContext 必须在用户手势中创建/恢复（锁定决策 #4） */
  unlock(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    }
    void this.ctx.resume();
  }

  /** 短音 = 振荡器 + 指数包络，零采样文件 */
  private blip(opts: {
    type: OscillatorType;
    from: number;
    to?: number;
    dur: number;
    vol: number;
    delay?: number;
  }): void {
    if (!this.ctx || this.muted) return;
    const { type, from, to, dur, vol, delay = 0 } = opts;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    if (to !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    }
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  cut(): void {
    this.blip({ type: 'triangle', from: 180, to: 60, dur: 0.12, vol: 0.5 });
  }

  perfect(combo: number): void {
    const step = PENTATONIC[Math.min(combo - 1, PENTATONIC.length - 1)] ?? 0;
    const freq = BASE_FREQ * Math.pow(2, step / 12);
    this.blip({ type: 'sine', from: freq, dur: 0.35, vol: 0.35 });
    this.blip({ type: 'sine', from: freq * 2, dur: 0.2, vol: 0.12, delay: 0.03 });
  }

  turn(): void {
    this.blip({ type: 'square', from: 440, to: 880, dur: 0.09, vol: 0.12 });
  }

  over(): void {
    this.blip({ type: 'sawtooth', from: 300, to: 60, dur: 0.5, vol: 0.3 });
  }
}