import { GameLoop } from './core/loop';
import { GameScene } from './render/scene';
import { GameView } from './render/view';
import { GameSession } from './game/session';
import { CONFIG } from './game/config';
import { onTap } from './input/pointer';
import { Hud } from './ui/hud';
import { Screens } from './ui/screens';
import { Synth } from './audio/synth';
import { renderShareCard } from './ui/shareCard';
import { loadBest, saveBest } from './storage/store';

type Phase = 'title' | 'playing' | 'over';

const container = document.getElementById('app');
if (!container) throw new Error('missing #app container');

const gameScene = new GameScene(container);
const session = new GameSession();
const view = new GameView(gameScene.scene, gameScene.camera);
const hud = new Hud();
const screens = new Screens();
const audio = new Synth();
const shareCanvas = document.createElement('canvas');

let phase: Phase = 'title';
let overAt = 0;

// ---- 静音按钮 ----
const muteBtn = document.getElementById('mute');
if (muteBtn) {
  muteBtn.classList.toggle('muted', audio.isMuted);
  muteBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    audio.unlock();
    muteBtn.classList.toggle('muted', audio.toggleMuted());
  });
}

// ---- 分享区：拦下点按（不许触发重开），提供保存 ----
const shareImg = document.getElementById('share-img');
const saveBtn = document.getElementById('save-btn');

function downloadCard(): void {
  if (!(shareImg instanceof HTMLImageElement) || !shareImg.src) return;
  const a = document.createElement('a');
  a.href = shareImg.src;
  a.download = `stack-turn-${session.layers}layers.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

for (const el of [shareImg, saveBtn]) {
  el?.addEventListener('pointerdown', (e) => e.stopPropagation());
  el?.addEventListener('click', downloadCard); // 桌面：点按下载；移动端以长按保存为主
}

// ---- 逻辑事件 → 表现层 ----

session.events.on('slider-spawned', ({ slider, layer, axisChanged }) => {
  view.spawnSlider(slider, layer, axisChanged);
  if (axisChanged) {
    view.ring(slider.x, slider.y, slider.z, Math.max(slider.width, slider.depth));
    audio.turn();
    hud.popup('方向旋转');
  }
});

session.events.on('placed', ({ block, debris, layer, kind }) => {
  view.addPlacedBlock(block, layer);
  view.spawnDebris(debris, block, layer);
  hud.setScore(layer);
  if (kind === 'perfect') {
    view.ring(
      block.x,
      block.y + CONFIG.BLOCK_HEIGHT / 2 + 0.02,
      block.z,
      Math.max(block.width, block.depth),
    );
    audio.perfect(session.combo);
    hud.popup(
      session.combo >= 2 ? `完美 ×${session.combo}` : '完美',
      session.combo >= CONFIG.GROW_AFTER,
    );
  } else {
    audio.cut();
  }
});

session.events.on('game-over', ({ layers, maxCombo, fallen }) => {
  view.spawnDebris([fallen], session.topBlock, session.tower.length);
  view.startGameOver(session.topBlock);
  audio.over();

  const prevBest = loadBest();
  const isNewBest = layers > prevBest;
  if (isNewBest) saveBest(layers);

  phase = 'over';
  overAt = performance.now();
  // 坠块 + 镜头拉远演 0.7s，再上结算屏与卡片
  window.setTimeout(() => {
    if (phase !== 'over') return;
    screens.showGameOver(
      layers, maxCombo,
      isNewBest ? '新纪录！' : `最高纪录 ${Math.max(prevBest, layers)} 层`,
    );
    renderShareCard(shareCanvas, { layers, maxCombo, isNewBest, tower: session.tower });
    screens.setShareImage(shareCanvas.toDataURL('image/png'));
  }, 700);
});

// ---- 统一点按：按阶段分发 ----

function restart(): void {
  screens.hideGameOver();
  screens.resetShare();
  view.reset();
  session.reset();
  hud.reset();
  phase = 'playing';
}

onTap(() => {
  audio.unlock();
  if (phase === 'title') {
    screens.hideTitle();
    hud.setVisible(true);
    phase = 'playing';
    return;
  }
  if (phase === 'playing') {
    session.tap();
    return;
  }
  if (performance.now() - overAt < 800) return;
  restart();
});

// ---- 启动 ----

session.reset();
hud.setVisible(false);
screens.setTitleBest(loadBest());
screens.showTitle();
loop_start();

function loop_start(): void {
  const loop = new GameLoop((dt) => {
    if (phase !== 'title') session.update(dt);
    view.syncSlider(session.slider);
    view.update(dt, session.topBlock);
    gameScene.render();
  });
  loop.start();
  requestAnimationFrame(() => document.getElementById('loading')?.remove());
}