import { describe, expect, it } from 'vitest';
import { nextCombo, regrowSize, sliderSpeed } from './scoring';
import { CONFIG } from './config';

describe('nextCombo', () => {
  it('perfect 连击 +1', () => expect(nextCombo(2, 'perfect')).toBe(3));
  it('cut 清零', () => expect(nextCombo(4, 'cut')).toBe(0));
  it('miss 清零', () => expect(nextCombo(4, 'miss')).toBe(0));
});

describe('regrowSize', () => {
  it('连击未达阈值不回涨', () =>
    expect(regrowSize(3, CONFIG.GROW_AFTER - 1)).toBe(3));
  it('达到阈值后按步长回涨', () =>
    expect(regrowSize(3, CONFIG.GROW_AFTER)).toBe(3 + CONFIG.GROW_STEP));
  it('不超过初始尺寸', () =>
    expect(regrowSize(CONFIG.INITIAL_SIZE - 0.1, 10)).toBe(CONFIG.INITIAL_SIZE));
});

describe('sliderSpeed', () => {
  it('第 0 层为基础速度', () => expect(sliderSpeed(0)).toBe(CONFIG.BASE_SPEED));
  it('封顶于最大速度', () => expect(sliderSpeed(999)).toBe(CONFIG.MAX_SPEED));
});