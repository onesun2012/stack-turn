import * as THREE from 'three';

interface Ring {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  age: number;
  life: number;
  from: number;
  to: number;
}

const RING_GEO = new THREE.RingGeometry(0.46, 0.5, 48);
const MAX_RINGS = 6;

/** 扩散光圈：小型对象池。size 传目标块的较大边长，环会贴合其外沿扩散 */
export class RingFx {
  private readonly pool: Ring[] = [];
  private readonly active: Ring[] = [];

  constructor(private readonly group: THREE.Group) {
    for (let i = 0; i < MAX_RINGS; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(RING_GEO, material);
      mesh.rotation.x = -Math.PI / 2; // 平躺在水平面上
      mesh.visible = false;
      this.group.add(mesh);
      this.pool.push({ mesh, material, age: 0, life: 0, from: 1, to: 2 });
    }
  }

  spawn(x: number, y: number, z: number, size: number): void {
    const ring = this.pool.pop();
    if (!ring) return; // 同屏极少超过上限，满了直接丢弃
    ring.age = 0;
    ring.life = 0.45;
    ring.from = size;
    ring.to = size * 1.9;
    ring.mesh.position.set(x, y, z);
    ring.mesh.scale.setScalar(ring.from);
    ring.mesh.visible = true;
    ring.material.opacity = 0.85;
    this.active.push(ring);
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const r = this.active[i]!;
      r.age += dt;
      const t = Math.min(1, r.age / r.life);
      r.mesh.scale.setScalar(r.from + (r.to - r.from) * t);
      r.material.opacity = 0.85 * (1 - t);
      if (t >= 1) {
        r.mesh.visible = false;
        this.active.splice(i, 1);
        this.pool.push(r);
      }
    }
  }

  reset(): void {
    for (const r of this.active) {
      r.mesh.visible = false;
      this.pool.push(r);
    }
    this.active.length = 0;
  }
}