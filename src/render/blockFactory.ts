import * as THREE from 'three';
import type { Block } from '../game/session';
import { CONFIG } from '../game/config';

// 共享单位几何体：塔块/滑块/碎片共用一个 BoxGeometry，尺寸用 scale 表达
const UNIT_BOX = new THREE.BoxGeometry(1, CONFIG.BLOCK_HEIGHT, 1);

// 材质缓存：键为取整色相；accent 用 +1000 偏移键位区分
const materialCache = new Map<number, THREE.MeshLambertMaterial>();

export function layerHue(layer: number): number {
  return (CONFIG.HUE_START + layer * CONFIG.HUE_STEP) % 360;
}

export function blockMaterial(layer: number, accent = false): THREE.MeshLambertMaterial {
  const hue = Math.round(layerHue(layer)) % 360;
  const key = accent ? hue + 1000 : hue;
  let mat = materialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshLambertMaterial();
    mat.color.setHSL(hue / 360, accent ? 0.7 : 0.55, accent ? 0.68 : 0.55);
    materialCache.set(key, mat);
  }
  return mat;
}

export function createBlockMesh(block: Block, layer: number, accent = false): THREE.Mesh {
  const mesh = new THREE.Mesh(UNIT_BOX, blockMaterial(layer, accent));
  mesh.scale.set(block.width, 1, block.depth);
  mesh.position.set(block.x, block.y, block.z);
  return mesh;
}

/** 供对象池创建可复用网格（颜色/尺寸在每次取出时重新赋值） */
export function createPooledMesh(): THREE.Mesh {
  return new THREE.Mesh(UNIT_BOX, blockMaterial(0));
}