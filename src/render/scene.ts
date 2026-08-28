import * as THREE from 'three';

const VIEW_SIZE = 10; // 正交视锥竖向覆盖的世界单位数

export class GameScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  private readonly renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // 性能预算：DPR 上限 2
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a24);
    this.scene.fog = new THREE.Fog(0x1a1a24, 20, 40);

    // 正交相机，45° 俯瞰——原版 Stack 气质的来源
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      (-VIEW_SIZE * aspect) / 2, (VIEW_SIZE * aspect) / 2,
      VIEW_SIZE / 2, -VIEW_SIZE / 2,
      0.1, 100,
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);

    // 注意：three r155+ 光照单位变更，强度按物理光照取值；M3 集中调参时再精调
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
    this.camera.left = (-VIEW_SIZE * aspect) / 2;
    this.camera.right = (VIEW_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}