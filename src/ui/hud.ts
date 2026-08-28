/** HUD：层数大数字 + 浮动提示（完美连击 / 换向）。纯 DOM，不依赖框架 */
export class Hud {
  private readonly root: HTMLElement;
  private readonly scoreEl: HTMLElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'hud';
    this.root.innerHTML = `<div class="hud-score">0</div>`;
    document.body.appendChild(this.root);
    const el = this.root.querySelector('.hud-score');
    if (!(el instanceof HTMLElement)) throw new Error('missing .hud-score');
    this.scoreEl = el;
  }

  setVisible(v: boolean): void {
    this.root.style.display = v ? '' : 'none';
  }

  setScore(n: number): void {
    this.scoreEl.textContent = String(n);
  }

  reset(): void {
    this.setScore(0);
  }

  /** 飘字：短暂出现后上飘淡出；accent 为金色（用于连击高位） */
  popup(text: string, accent = false): void {
    const el = document.createElement('div');
    el.className = `hud-popup${accent ? ' accent' : ''}`;
    el.textContent = text;
    this.root.appendChild(el);
    window.setTimeout(() => el.remove(), 900);
  }
}