const SETTINGS_KEY = 'stack-turn:settings';
const BEST_KEY = 'stack-turn:best';

export interface Settings {
  muted: boolean;
}

const DEFAULTS: Settings = { muted: false };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return { ...DEFAULTS }; // 隐私模式等不可用场景，静默降级
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* 持久化失败不影响游戏 */ }
}

export function loadBest(): number {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  } catch {
    return 0;
  }
}

export function saveBest(n: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(Math.floor(n)));
  } catch { /* 同上 */ }
}