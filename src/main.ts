import { GameLoop } from './core/loop';
import { GameScene } from './render/scene';
import { GameView } from './render/view';
import { GameSession } from './game/session';
import { onTap } from './input/pointer';

const container = document.getElementById('app');
if (!container) throw new Error('missing #app container');

const gameScene = new GameScene(container);
const session = new GameSession();
const view = new GameView(gameScene.scene, gameScene.camera);

// 逻辑事件 → 渲染映射（两层在此接线，互不感知）
session.events.on('slider-spawned', ({ slider, layer }) => view.spawnSlider(slider, layer));

session.events.on('placed', ({ block, debris, layer, kind }) => {
  view.addPlacedBlock(block, layer);
  view.spawnDebris(debris, block, layer);
  console.log(`第 ${layer} 层：${kind === 'perfect' ? '完美!' : '切割'}`); // 临时，M3 换 HUD
});

session.events.on('game-over', ({ fallen }) => {
  view.spawnDebris([fallen], session.topBlock, session.tower.length);
  view.startGameOver(session.towerTopY);
  console.log(`游戏结束：${session.layers} 层`); // 临时，M3 换结算屏
});

onTap(() => {
  if (session.state === 'over') {
    view.reset();
    session.reset();
  } else {
    session.tap();
  }
});

const loop = new GameLoop((dt) => {
  session.update(dt);
  view.syncSlider(session.slider);
  view.update(dt, session.towerTopY);
  gameScene.render();
});

session.reset();
loop.start();