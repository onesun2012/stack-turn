import { describe, expect, it } from 'vitest';
import { axisForLayer } from './rotation';

describe('axisForLayer（每 N 层换轴）', () => {
  it('默认间隔 3：1..3 层为 x', () => {
    expect(axisForLayer(1)).toBe('x');
    expect(axisForLayer(3)).toBe('x');
  });

  it('4..6 层为 z，7..9 层回到 x', () => {
    expect(axisForLayer(4)).toBe('z');
    expect(axisForLayer(6)).toBe('z');
    expect(axisForLayer(7)).toBe('x');
    expect(axisForLayer(9)).toBe('x');
  });

  it('第 3N+1 层是换轴点（边界）', () => {
    expect(axisForLayer(3)).toBe('x');
    expect(axisForLayer(4)).toBe('z');
    expect(axisForLayer(6)).toBe('z');
    expect(axisForLayer(7)).toBe('x');
  });

  it('自定义间隔 2：1-2 为 x，3-4 为 z，5-6 为 x', () => {
    expect(axisForLayer(2, 2)).toBe('x');
    expect(axisForLayer(3, 2)).toBe('z');
    expect(axisForLayer(5, 2)).toBe('x');
  });
});