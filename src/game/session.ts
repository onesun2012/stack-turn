import { CONFIG } from './config';
import { slice1D, type Piece } from './cutter';
import { nextCombo, regrowSize, sliderSpeed } from './scoring';
import { Emitter } from '../core/emitter';

export type Axis = 'x' | 'z';

export interface Block {
  x: number;
  z: number;
  y: number;      // 层中心高度
  width: number;  // x 方向尺寸
  depth: number;  // z 方向尺寸
}

export interface SliderState {
  x: number;
  z: number;
  y: number;
  width: number;
  depth: number;
  dir: 1 | -1;
  speed: number;
}

export type SessionState = 'idle' | 'playing' | 'dropping' | 'over';

export type SessionEvents = {
  'slider-spawned': { slider: SliderState; layer: number };
  placed: { layer: number; block: Block; kind: 'perfect' | 'cut'; debris: Block[] };
  'game-over': { layers: number; fallen: Block };
};

export class GameSession {
  readonly events = new Emitter<SessionEvents>();

  state: SessionState = 'idle';
  tower: Block[] = [];
  slider: SliderState | null = null;
  combo = 0;
  layers = 0;

  /** 当前滑动轴。M1 恒为 'x'；M2 的滑轨旋转只需切换此字段。 */
  axis: Axis = 'x';

  get topBlock(): Block {
    return this.tower[this.tower.length - 1]!;
  }

  get towerTopY(): number {
    return this.topBlock.y;
  }

  reset(): void {
    this.tower = [{
      x: 0, z: 0, y: 0,
      width: CONFIG.INITIAL_SIZE, depth: CONFIG.INITIAL_SIZE,
    }];
    this.combo = 0;
    this.layers = 0;
    this.state = 'playing';
    this.spawnSlider();
  }

  /** 玩家点按：滑块停止平移，开始下落 */
  tap(): void {
    if (this.state !== 'playing') return;
    this.state = 'dropping';
  }

  update(dt: number): void {
    if (this.state === 'playing') this.moveSlider(dt);
    else if (this.state === 'dropping') this.dropSlider(dt);
  }

  // ---- 内部逻辑 ----

  private moveSlider(dt: number): void {
    const s = this.slider;
    if (!s) return;
    const range = CONFIG.SLIDER_RANGE;
    let pos = this.readAxis(s) + s.dir * s.speed * dt;
    if (pos > range) { pos = range - (pos - range); s.dir = -1; }
    else if (pos < -range) { pos = -range - (pos + range); s.dir = 1; }
    this.writeAxis(s, pos);
  }

  private dropSlider(dt: number): void {
    const s = this.slider;
    if (!s) return;
    const targetY = this.nextLayerY();
    s.y -= CONFIG.DROP_SPEED * dt;
    if (s.y <= targetY) {
      s.y = targetY;
      this.resolve();
    }
  }

  private nextLayerY(): number {
    return this.towerTopY + CONFIG.BLOCK_HEIGHT;
  }

  private spawnSlider(): void {
    const top = this.topBlock;
    const layer = this.tower.length;
    this.slider = {
      x: 0, z: 0,
      y: this.nextLayerY() + CONFIG.HOVER_HEIGHT,
      width: top.width,   // 继承下层尺寸
      depth: top.depth,
      dir: 1,
      speed: sliderSpeed(layer),
    };
    this.writeAxis(this.slider, -CONFIG.SLIDER_RANGE);
    this.events.emit('slider-spawned', { slider: { ...this.slider }, layer });
  }

  /** 落地结算：切割判定 → 更新塔/连击 → 发事件 → 生成下一块 */
  private resolve(): void {
    const s = this.slider;
    if (!s) return;
    const top = this.topBlock;
    const axis = this.axis;
    const y = this.nextLayerY();

    const moving: Piece = axis === 'x'
      ? { center: s.x, size: s.width }
      : { center: s.z, size: s.depth };
    const placed: Piece = axis === 'x'
      ? { center: top.x, size: top.width }
      : { center: top.z, size: top.depth };

    const result = slice1D(moving, placed, CONFIG.PERFECT_TOLERANCE);

    if (result.kind === 'miss') {
      this.slider = null;
      this.state = 'over';
      this.events.emit('game-over', {
        layers: this.layers,
        fallen: { x: s.x, z: s.z, y, width: s.width, depth: s.depth },
      });
      return;
    }

    this.combo = nextCombo(this.combo, result.kind);
    const size = result.kind === 'perfect'
      ? regrowSize(result.size, this.combo)
      : result.kept.size;
    const center = result.kind === 'perfect' ? result.center : result.kept.center;

    const block: Block = axis === 'x'
      ? { x: center, z: s.z, y, width: size, depth: s.depth }
      : { x: s.x, z: center, y, width: s.width, depth: size };

    const debris: Block[] = result.kind === 'cut'
      ? result.debris.map((p) => axis === 'x'
        ? { x: p.center, z: s.z, y, width: p.size, depth: s.depth }
        : { x: s.x, z: p.center, y, width: s.width, depth: p.size })
      : [];

    this.tower.push(block);
    this.layers += 1;
    this.slider = null;
    this.events.emit('placed', {
      layer: this.tower.length - 1, block, kind: result.kind, debris,
    });
    this.state = 'playing';
    this.spawnSlider();
  }

  private readAxis(s: SliderState): number {
    return this.axis === 'x' ? s.x : s.z;
  }

  private writeAxis(s: SliderState, value: number): void {
    if (this.axis === 'x') s.x = value;
    else s.z = value;
  }
}