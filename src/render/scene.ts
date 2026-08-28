import * as THREE from 'three';

/** 水平方向固定视野宽度（世界单位），竖向按宽高比推导。
 *  min(aspect, 1.5)：桌面宽屏下避免竖向视野过窄。 */
export const VIEW_WIDTH = 12;

export class GameScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  private readonly renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a24);
    this.scene.fog = new THREE.Fog(0x1a1a24, 22, 45);

    const aspect = window.innerWidth / window.innerHeight;
    const halfW = VIEW_WIDTH / 2;
    const halfH = halfW / Math.min(aspect, 1.5);
    this.camera = new THREE.OrthographicCamera(
      -halfW, halfW, halfH, -halfH, 0.1, 100,
    );

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const dir = new THREE.DirectionalLight(0xffffff, 2.2);
    dir.position.set(5, 10, 7);
    this.scene.add(dir);

    window.addEventListener('resize', () => this.handleResize());
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const halfW = VIEW_WIDTH / 2;
    const halfH = halfW / Math.min(aspect, 1.5);
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}