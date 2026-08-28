import { describe, expect, it } from 'vitest';
import { GameSession } from './session';
import { CONFIG } from './config';

/** 把滑块摆到与塔顶对齐 → 必然 perfect；一步 update 完成下落与结算 */
function placePerfect(session: GameSession): void {
  const s = session.slider!;
  const top = session.topBlock;
  if (session.axis === 'x') s.x = top.x;
  else s.z = top.z;
  session.tap();
  session.update(1);
}

describe('GameSession 滑轨旋转', () => {
  it('每 3 层换轴：x → z → x', () => {
    const session = new GameSession();
    session.reset();
    expect(session.axis).toBe('x');
    placePerfect(session);
    placePerfect(session);
    placePerfect(session);
    expect(session.axis).toBe('z'); // 第 4 层换轴
    placePerfect(session);
    placePerfect(session);
    placePerfect(session);
    expect(session.axis).toBe('x'); // 第 7 层换回
    expect(session.layers).toBe(6);
  });

  it('换轴后滑块横轴对齐塔顶（塔漂移不写死 0）', () => {
    const session = new GameSession();
    session.reset();
    // 故意偏 1 个单位切割 → 塔顶向右漂移
    const s = session.slider!;
    s.x = session.topBlock.x + 1;
    session.tap();
    session.update(1);
    expect(session.layers).toBe(1);
    expect(session.topBlock.x).toBeCloseTo(0.5);

    // 第 2 层仍在 x 轴：横轴 z 对齐塔顶
    expect(session.axis).toBe('x');
    expect(session.slider!.z).toBe(session.topBlock.z);
    expect(Math.abs(session.slider!.x)).toBe(CONFIG.SLIDER_RANGE);

    // 连续完美到第 4 层 → 换 z 轴：横轴 x 对齐已漂移的塔顶
    placePerfect(session);
    placePerfect(session);
    expect(session.axis).toBe('z');
    expect(session.slider!.x).toBeCloseTo(session.topBlock.x);
    expect(Math.abs(session.slider!.z)).toBe(CONFIG.SLIDER_RANGE);
  });
});