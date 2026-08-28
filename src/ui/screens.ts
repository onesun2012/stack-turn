/** 标题屏 / 结算屏。覆盖层 pointer-events:none，点按全部落回 window 统一处理 */
export class Screens {
  private readonly title = this.require('#title');
  private readonly over = this.require('#over');
  private readonly overScore = this.require('#over-score');
  private readonly overDetail = this.require('#over-detail');

  showTitle(): void {
    this.title.classList.remove('hidden');
  }

  hideTitle(): void {
    this.title.classList.add('hidden');
  }

  showGameOver(layers: number, maxCombo: number): void {
    this.overScore.textContent = String(layers);
    this.overDetail.textContent = `最大连击 ×${maxCombo}`;
    this.over.classList.remove('hidden');
  }

  hideGameOver(): void {
    this.over.classList.add('hidden');
  }

  private require(sel: string): HTMLElement {
    const el = document.querySelector(sel);
    if (!(el instanceof HTMLElement)) throw new Error(`missing ${sel}`);
    return el;
  }
}