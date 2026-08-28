const KEY = 'stack-turn:settings';

export interface Settings {
  muted: boolean;
}

const DEFAULTS: Settings = { muted: false };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEFAULTS }; // 隐私模式等 localStorage 不可用的场景
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 持久化失败不影响游戏 */
  }
}