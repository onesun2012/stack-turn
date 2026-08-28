import { describe, expect, it } from 'vitest';
import { slice1D } from './cutter';

describe('slice1D', () => {
  it('完全无重合 → miss', () => {
    expect(slice1D({ center: 3, size: 2 }, { center: 0, size: 2 }, 0.3).kind).toBe('miss');
  });

  it('居中对齐 → perfect 且吸附到下层位置', () => {
    expect(slice1D({ center: 0.2, size: 2 }, { center: 0, size: 2 }, 0.3))
      .toEqual({ kind: 'perfect', center: 0, size: 2 });
  });

  it('偏差恰好在容差边界 → perfect（闭区间）', () => {
    expect(slice1D({ center: 0.3, size: 2 }, { center: 0, size: 2 }, 0.3).kind).toBe('perfect');
  });

  it('向右偏出 → 保留左侧重合区，右侧为碎片', () => {
    const r = slice1D({ center: 0.8, size: 2 }, { center: 0, size: 2 }, 0.3);
    if (r.kind !== 'cut') throw new Error('expected cut');
    expect(r.kept).toEqual({ center: 0.4, size: 1.2 });
    expect(r.debris).toEqual([{ center: 1.4, size: 0.8 }]);
  });

  it('向左偏出 → 对称结果', () => {
    const r = slice1D({ center: -0.8, size: 2 }, { center: 0, size: 2 }, 0.3);
    if (r.kind !== 'cut') throw new Error('expected cut');
    expect(r.kept).toEqual({ center: -0.4, size: 1.2 });
    expect(r.debris).toEqual([{ center: -1.4, size: 0.8 }]);
  });

  it('滑块回涨后大于下层且偏移 → 保留 = 下层，两侧都有碎片', () => {
    const r = slice1D({ center: 0.5, size: 4 }, { center: 0, size: 2 }, 0.3);
    if (r.kind !== 'cut') throw new Error('expected cut');
    expect(r.kept).toEqual({ center: 0, size: 2 });
    expect(r.debris).toHaveLength(2);
  });
});