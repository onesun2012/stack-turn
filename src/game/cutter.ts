/** 一维切割：给定滑块与下层在当前轴上的区间，算出保留部分与碎片。
 *  纯函数、轴无关——x / z 通用（M2 的滑轨旋转直接复用）。 */

export interface Piece {
  center: number;
  size: number;
}

export type SliceResult =
  | { kind: 'miss' }
  | { kind: 'perfect'; center: number; size: number }
  | { kind: 'cut'; kept: Piece; debris: Piece[] };

const EPS = 1e-6;

export function slice1D(
  moving: Piece,
  placed: Piece,
  tolerance: number,
): SliceResult {
  const mMin = moving.center - moving.size / 2;
  const mMax = moving.center + moving.size / 2;
  const pMin = placed.center - placed.size / 2;
  const pMax = placed.center + placed.size / 2;

  const overlapStart = Math.max(mMin, pMin);
  const overlapEnd = Math.min(mMax, pMax);
  const overlap = overlapEnd - overlapStart;

  // 无重合 → 游戏结束
  if (overlap <= EPS) return { kind: 'miss' };

  // 中心偏差在容差内 → 完美：吸附到下层（即便几乎没搭上也算，经典规则）
  if (Math.abs(moving.center - placed.center) <= tolerance) {
    return { kind: 'perfect', center: placed.center, size: placed.size };
  }

  // 常规切割：保留重合区，两侧多余部分都是碎片（滑块回涨变大后两侧都会掉）
  const kept: Piece = { center: (overlapStart + overlapEnd) / 2, size: overlap };
  const debris: Piece[] = [];
  const leftSize = overlapStart - mMin;
  if (leftSize > EPS) debris.push({ center: mMin + leftSize / 2, size: leftSize });
  const rightSize = mMax - overlapEnd;
  if (rightSize > EPS) debris.push({ center: mMax - rightSize / 2, size: rightSize });
  return { kind: 'cut', kept, debris };
}