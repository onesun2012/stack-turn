import { GameLoop } from './core/loop';
import { GameScene } from './render/scene';
import { GameView } from './render/view';
import { GameSession } from './game/session';
import { CONFIG } from './game/config';
import { onTap } from './input/pointer';
import { Hud } from './ui/hud';
import { Screens } from './ui/screens';
import { Synth } from './audio/synth';

type Phase = 'title' | 'playing' | 'over';

const container = document.getElementById('app');
if (!container) throw new Error('missing #app container');

const gameScene = new GameScene(container);
const session = new GameSession();
const view = new GameView(gameScene.scene, gameScene.camera);
const hud = new Hud();
const screens = new Screens();
const audio = new Synth();

let phase: Phase = 'title';
let overAt = 0;

// ---- 静音按钮：拦截点按，不能让静音操作触发落块 ----
const muteBtn = document.getElementById('mute');
if (muteBtn) {
  muteBtn.classList.toggle('muted', audio.isMuted);
  muteBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation(); // 不冒泡到 window 的游戏点按
    e.preventDefault();  // 不聚焦：避免空格键误触按钮
    audio.unlock();
    muteBtn.classList.toggle('muted', audio.toggleMuted());
  });
}

// ---- 逻辑事件 → 表现层接线（两层在此相见，互不感知）----

session.events.on('slider-spawned', ({ slider, layer, axisChanged }) => {
  view.spawnSlider(slider, layer, axisChanged); // 换向段首层高亮
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
      block.y + CONFIG.BLOCK_HEIGHT / 2 + 0.02, // 贴着块顶面扩散
      block.z,
      Math.max(block.width, block.depth),
    );
    audio.perfect(session.combo);
    hud.popup(
      session.combo >= 2 ? `完美 ×${session.combo}` : '完美',
      session.combo >= CONFIG.GROW_AFTER, // 即将/正在回涨时转金色
    );
  } else {
    audio.cut();
  }
});

session.events.on('game-over', ({ layers, maxCombo, fallen }) => {
  view.spawnDebris([fallen], session.topBlock, session.tower.length);
  view.startGameOver(session.topBlock);
  audio.over();
  phase = 'over';
  overAt = performance.now();
  // 先让坠块与镜头拉远演 0.7s，再上结算屏
  window.setTimeout(() => {
    if (phase === 'over') screens.showGameOver(layers, maxCombo);
  }, 700);
});

// ---- 统一点按：按阶段分发 ----

function restart(): void {
  screens.hideGameOver();
  view.reset();
  session.reset();
  hud.reset();
  phase = 'playing';
}

onTap(() => {
  audio.unlock(); // 手势内解锁音频（锁定决策 #4）
  if (phase === 'title') {
    screens.hideTitle();
    hud.setVisible(true);
    phase = 'playing';
    return; // 开始游戏的那次点按不落块
  }
  if (phase === 'playing') {
    session.tap();
    return;
  }
  // over：800ms 防误触（连打导致的失误手，常会下意识再点一下）
  if (performance.now() - overAt < 800) return;
  restart();
});

// ---- 启动 ----

session.reset();          // 塔与滑块就位，静止展示在标题屏背后
hud.setVisible(false);
screens.showTitle();
loop_start();

function loop_start(): void {
  const loop = new GameLoop((dt) => {
    if (phase !== 'title') session.update(dt); // 标题阶段冻结滑块，不让玩家凭空承受计时压力
    view.syncSlider(session.slider);
    view.update(dt, session.topBlock);
    gameScene.render();
  });
  loop.start();
  // 首帧渲染完成后撤掉 loading 遮罩
  requestAnimationFrame(() => document.getElementById('loading')?.remove());
}