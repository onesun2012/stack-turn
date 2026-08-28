import * as THREE from 'three';
import type { Block } from '../game/session';
import { CONFIG } from '../game/config';

export function layerHue(layer: number): number {
  return (CONFIG.HUE_START + layer * CONFIG.HUE_STEP) % 360;
}

export function createBlockMesh(block: Block, layer: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(block.width, CONFIG.BLOCK_HEIGHT, block.depth);
  const material = new THREE.MeshLambertMaterial();
  material.color.setHSL(layerHue(layer) / 360, 0.55, 0.55);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(block.x, block.y, block.z);
  return mesh;
}

export function disposeMesh(mesh: THREE.Mesh): void {
  mesh.geometry.dispose();
  (mesh.material as THREE.Material).dispose();
}