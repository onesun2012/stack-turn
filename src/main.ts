import * as THREE from 'three';
import { GameLoop } from './core/loop';
import { GameScene } from './render/scene';

const container = document.getElementById('app');
if (!container) throw new Error('missing #app container');

const game = new GameScene(container);

// —— M0 冒烟测试：M1 将替换为真实的塔与滑块 ——
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshLambertMaterial({ color: 0x4ecdc4 }),
);
game.scene.add(cube);

const loop = new GameLoop((dt) => {
  cube.rotation.y += dt * 0.8;
  cube.rotation.x += dt * 0.3;
  game.render();
});
loop.start();