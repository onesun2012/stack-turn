import * as THREE from 'three';
import type { Block, SliderState } from '../game/session';
import { createBlockMesh } from './blockFactory';
import { DebrisPool } from './debrisPool';
import { VIEW_WIDTH } from './scene';

const CAMERA_OFFSET = 10;
const FOLLOW_LERP = 5;   // 镜头跟随平滑系数
const ZOOM_LERP = 2.5;

export class GameView {
  private readonly group = new THREE.Group();
  private readonly debris: DebrisPool;
  private readonly placed = new Set<THREE.Mesh>();
  private sliderMesh: THREE.Mesh | null = null;

  // 镜头跟随（含 x/z：塔会漂移，镜头必须跟着走）
  private follow = { x: 0, y: 0, z: 0 };
  private target = { x: 0, y: 0, z: 0 };
  private zoomTarget = 1;
  private gameOver = false;

  constructor(
    scene: THREE.Scene,
    private readonly camera: THREE.OrthographicCamera,
  ) {
    this.debris = new DebrisPool(this.group);
    scene.add(this.group);
    this.camera.position.set(CAMERA_OFFSET, CAMERA_OFFSET, CAMERA_OFFSET);
    this.camera.lookAt(0, 0, 0);
  }

  addPlacedBlock(block: Block, layer: number): void {
    const mesh = createBlockMesh(block, layer);
    this.group.add(mesh);
    this.placed.add(mesh);
  }

  spawnSlider(slider: SliderState, layer: number): void {
    this.removeSlider();
    this.sliderMesh = createBlockMesh(slider, layer); // 结构兼容 Block
    this.group.add(this.sliderMesh);
  }

  syncSlider(slider: SliderState | null): void {
    if (!slider || !this.sliderMesh) return;
    this.sliderMesh.position.set(slider.x, slider.y, slider.z);
  }

  spawnDebris(blocks: Block[], source: Block, layer: number): void {
    this.debris.spawn(blocks, source, layer);
  }

  /** 结束演出：镜头居中到塔顶，zoom 拉远收纳全塔 */
  startGameOver(top: Block): void {
    this.gameOver = true;
    this.target.x = top.x;
    this.target.y = top.y / 2;
    this.target.z = top.z;
    const aspect = window.innerWidth / window.innerHeight;
    const verticalView = VIEW_WIDTH / Math.min(aspect, 1.5);
    this.zoomTarget = Math.min(1, (verticalView * 0.85) / (top.y + 10));
  }

  update(dt: number, top: Block): void {
    if (!this.gameOver) {
      this.target.x = top.x;
      this.target.y = top.y;
      this.target.z = top.z;
    }
    const k = Math.min(1, dt * FOLLOW_LERP);
    this.follow.x += (this.target.x - this.follow.x) * k;
    this.follow.y += (this.target.y - this.follow.y) * k;
    this.follow.z += (this.target.z - this.follow.z) * k;

    if (Math.abs(this.camera.zoom - this.zoomTarget) > 1e-3) {
      this.camera.zoom += (this.zoomTarget - this.camera.zoom) * Math.min(1, dt * ZOOM_LERP);
      this.camera.updateProjectionMatrix();
    }

    this.camera.position.set(
      this.follow.x + CAMERA_OFFSET,
      this.follow.y + CAMERA_OFFSET,
      this.follow.z + CAMERA_OFFSET,
    );
    this.camera.lookAt(this.follow.x, this.follow.y, this.follow.z);

    this.debris.update(dt, this.follow.y - 25);
  }

  reset(): void {
    // 共享几何体/材质不 dispose，仅从场景移除
    for (const mesh of this.placed) this.group.remove(mesh);
    this.placed.clear();
    this.removeSlider();
    this.debris.releaseAll();
    this.follow = { x: 0, y: 0, z: 0 };
    this.target = { x: 0, y: 0, z: 0 };
    this.zoomTarget = 1;
    this.gameOver = false;
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }

  private removeSlider(): void {
    if (!this.sliderMesh) return;
    this.group.remove(this.sliderMesh);
    this.sliderMesh = null;
  }
}