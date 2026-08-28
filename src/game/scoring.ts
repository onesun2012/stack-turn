import { CONFIG } from './config';

export type PlaceKind = 'perfect' | 'cut' | 'miss';

/** 连击：perfect +1，其余清零 */
export function nextCombo(combo: number, kind: PlaceKind): number {
  return kind === 'perfect' ? combo + 1 : 0;
}

/** 连续完美达阈值后方块回涨，上限为初始尺寸 */
export function regrowSize(size: number, combo: number): number {
  if (combo < CONFIG.GROW_AFTER) return size;
  return Math.min(size + CONFIG.GROW_STEP, CONFIG.INITIAL_SIZE);
}

/** 滑块速度随层数递增，封顶 */
export function sliderSpeed(layer: number): number {
  return Math.min(CONFIG.BASE_SPEED + layer * CONFIG.SPEED_INC, CONFIG.MAX_SPEED);
}