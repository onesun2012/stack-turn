/** 集中调参表：M3 会在这里做一次集中调整 */
export const CONFIG = {
  BLOCK_HEIGHT: 1,      // 单层高度
  INITIAL_SIZE: 5,      // 初始底座边长
  SLIDER_RANGE: 3.5,    // 滑块中心往复范围（±）
  HOVER_HEIGHT: 2.5,    // 滑块悬停于目标层上方的高度
  DROP_SPEED: 25,       // 点按后下落速度（单位/秒）

  BASE_SPEED: 3.5,      // 滑块初速
  SPEED_INC: 0.12,      // 每层增速
  MAX_SPEED: 9,

  PERFECT_TOLERANCE: 0.3, // 完美判定容差（中心偏差）
  GROW_AFTER: 3,          // 连续完美达到该次数后开始回涨
  GROW_STEP: 0.25,        // 每次回涨量

  HUE_START: 190,       // 色相起点
  HUE_STEP: 6,          // 每层色相步进
  GRAVITY: 30,          // 碎片重力（仅视觉）
} as const;