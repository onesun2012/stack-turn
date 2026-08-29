/** 标题屏 / 结算屏。覆盖层 pointer-events:none，交互元素单独开启 */
export class Screens {
  private readonly title = this.require('#title');
  private readonly titleBest = this.require('#title-best');
  private readonly over = this.require('#over');
  private readonly overScore = this.require('#over-score');
  private readonly overDetail = this.require('#over-detail');
  private readonly overBest = this.require('#over-best');
  private readonly shareImg = this.require('#share-img') as HTMLImageElement;
  private readonly shareHint = this.require('#share-hint');
  private readonly saveBtn = this.require('#save-btn');

  showTitle(): void {
    this.title.classList.remove('hidden');
  }

  hideTitle(): void {
    this.title.classList.add('hidden');
  }

  setTitleBest(best: number): void {
    if (best <= 0) return;
    this.titleBest.textContent = `最高纪录 ${best} 层`;
    this.titleBest.classList.remove('off');
  }

  showGameOver(layers: number, maxCombo: number, bestLine: string): void {
    this.overScore.textContent = String(layers);
    this.overDetail.textContent = `最大连击 ×${maxCombo}`;
    this.overBest.textContent = bestLine;
    this.over.classList.remove('hidden');
  }

  hideGameOver(): void {
    this.over.classList.add('hidden');
  }

  setShareImage(dataUrl: string): void {
    this.shareImg.src = dataUrl;
    for (const el of [this.shareImg, this.shareHint, this.saveBtn]) {
      el.classList.remove('off');
    }
  }

  resetShare(): void {
    this.shareImg.removeAttribute('src');
    for (const el of [this.shareImg, this.shareHint, this.saveBtn]) {
      el.classList.add('off');
    }
  }

  private require(sel: string): HTMLElement {
    const el = document.querySelector(sel);
    if (!(el instanceof HTMLElement)) throw new Error(`missing ${sel}`);
    return el;
  }
}