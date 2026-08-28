import * as THREE from 'three';
import type { Block } from '../game/session';
import { CONFIG } from '../game/config';
import { blockMaterial, createPooledMesh } from './blockFactory';

interface ActiveDebris {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  rz: number;
}

/**
 * 碎片对象池：网格复用，杜绝每刀的几何体/材质分配与 GC，
 * 移动端稳 60fps 的关键之一。池按需增长（同屏碎片天然很少）。
 */
export class DebrisPool {
  private readonly free: THREE.Mesh[] = [];
  private readonly active: ActiveDebris[] = [];

  constructor(private readonly group: THREE.Group) {}

  spawn(blocks: Block[], source: Block, layer: number): void {
    for (const b of blocks) {
      const mesh = this.free.pop() ?? createPooledMesh();
      mesh.material = blockMaterial(layer);
      mesh.scale.set(b.width, 1, b.depth);
      mesh.rotation.set(0, 0, 0);
      mesh.position.set(b.x, b.y, b.z);
      this.group.add(mesh);
      this.active.push({
        mesh,
        vx: Math.sign(b.x - source.x) * (2 + Math.random() * 1.5),
        vz: Math.sign(b.z - source.z) * (2 + Math.random() * 1.5),
        vy: 2 + Math.random() * 2,
        rx: (Math.random() * 2 - 1) * 4,
        rz: (Math.random() * 2 - 1) * 4,
      });
    }
  }

  update(dt: number, floorY: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const d = this.active[i]!;
      d.vy -= CONFIG.GRAVITY * dt;
      d.mesh.position.x += d.vx * dt;
      d.mesh.position.y += d.vy * dt;
      d.mesh.position.z += d.vz * dt;
      d.mesh.rotation.x += d.rx * dt;
      d.mesh.rotation.z += d.rz * dt;
      if (d.mesh.position.y < floorY) {
        this.group.remove(d.mesh);
        this.free.push(d.mesh);
        this.active.splice(i, 1);
      }
    }
  }

  releaseAll(): void {
    for (const d of this.active) this.group.remove(d.mesh);
    this.free.push(...this.active.map((d) => d.mesh));
    this.active.length = 0;
  }
}