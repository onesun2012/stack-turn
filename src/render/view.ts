import * as THREE from 'three';
import type { Block, SliderState } from '../game/session';
import { CONFIG } from '../game/config';
import { createBlockMesh, disposeMesh } from './blockFactory';
import { VIEW_WIDTH } from './scene';

interface Debris {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  rz: number;
}

const CAMERA_OFFSET = 10;

export class GameView {
  private readonly group = new THREE.Group();
  private readonly placed = new Set<THREE.Mesh>();
  private sliderMesh: THREE.Mesh | null = null;
  private debris: Debris[] = [];

  private followY = 0;
  private followTargetY = 0;
  private zoomTarget = 1;
  private gameOver = false;

  constructor(
    scene: THREE.Scene,
    private readonly camera: THREE.OrthographicCamera,
  ) {
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
    for (const b of blocks) {
      const mesh = createBlockMesh(b, layer);
      this.group.add(mesh);
      // 向"远离保留块"的方向飞出，带随机翻滚
      this.debris.push({
        mesh,
        vx: Math.sign(b.x - source.x) * (2 + Math.random() * 1.5),
        vz: Math.sign(b.z - source.z) * (2 + Math.random() * 1.5),
        vy: 2 + Math.random() * 2,
        rx: (Math.random() * 2 - 1) * 4,
        rz: (Math.random() * 2 - 1) * 4,
      });
    }
  }

  /** 结束演出：视点上移到塔身中部，zoom 拉远收纳全塔 */
  startGameOver(topY: number): void {
    this.gameOver = true;
    this.followTargetY = topY / 2;
    const aspect = window.innerWidth / window.innerHeight;
    const verticalView = VIEW_WIDTH / Math.min(aspect, 1.5);
    this.zoomTarget = Math.min(1, (verticalView * 0.85) / (topY + 10));
  }

  update(dt: number, towerTopY: number): void {
    if (!this.gameOver) this.followTargetY = towerTopY;
    this.followY += (this.followTargetY - this.followY) * Math.min(1, dt * 5);

    if (Math.abs(this.camera.zoom - this.zoomTarget) > 1e-3) {
      this.camera.zoom += (this.zoomTarget - this.camera.zoom) * Math.min(1, dt * 2.5);
      this.camera.updateProjectionMatrix();
    }

    this.camera.position.set(CAMERA_OFFSET, this.followY + CAMERA_OFFSET, CAMERA_OFFSET);
    this.camera.lookAt(0, this.followY, 0);
    this.updateDebris(dt);
  }

  reset(): void {
    for (const m of this.placed) { this.group.remove(m); disposeMesh(m); }
    this.placed.clear();
    this.removeSlider();
    for (const d of this.debris) { this.group.remove(d.mesh); disposeMesh(d.mesh); }
    this.debris = [];
    this.followY = 0;
    this.followTargetY = 0;
    this.zoomTarget = 1;
    this.gameOver = false;
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }

  private removeSlider(): void {
    if (!this.sliderMesh) return;
    this.group.remove(this.sliderMesh);
    disposeMesh(this.sliderMesh);
    this.sliderMesh = null;
  }

  private updateDebris(dt: number): void {
    const floorY = this.followY - 25; // 落出视野即回收
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i]!;
      d.vy -= CONFIG.GRAVITY * dt;
      d.mesh.position.x += d.vx * dt;
      d.mesh.position.y += d.vy * dt;
      d.mesh.position.z += d.vz * dt;
      d.mesh.rotation.x += d.rx * dt;
      d.mesh.rotation.z += d.rz * dt;
      if (d.mesh.position.y < floorY) {
        this.group.remove(d.mesh);
        disposeMesh(d.mesh);
        this.debris.splice(i, 1);
      }
    }
  }
}