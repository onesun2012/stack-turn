import { CONFIG } from './config';

export type Axis = 'x' | 'z';

/**
 * 滑轨分段旋转 —— 本作的核心反转机制：
 * 每 ROTATION_INTERVAL 层切换一次滑动轴，x → z → x 交替。
 * 与经典 Stack 的逐层换轴不同，成段换轴带来"段落感"节奏。
 */
export function axisForLayer(
  layer: number,
  interval: number = CONFIG.ROTATION_INTERVAL,
): Axis {
  const segment = Math.floor((layer - 1) / interval);
  return segment % 2 === 0 ? 'x' : 'z';
}