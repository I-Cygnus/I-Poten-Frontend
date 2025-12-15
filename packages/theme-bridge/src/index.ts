// @jobspoon/theme-bridge/index.ts
export type Theme = 'light' | 'dark';

type Store = { current: Theme; listeners: Set<(t: Theme) => void> };

const g = globalThis as any;
if (!g.__JOB_SPOON_THEME_BRIDGE__) {
  g.__JOB_SPOON_THEME_BRIDGE__ = {
    current:
      (typeof window !== 'undefined' &&
        (localStorage.getItem('theme') as Theme)) || 'light',
    listeners: new Set(),
  } as Store;
}
const store: Store = g.__JOB_SPOON_THEME_BRIDGE__;

export const getTheme = () => store.current;

export function setTheme(t: Theme) {
  if (t === store.current) return;
  store.current = t;
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
    (document.documentElement.style as any).colorScheme = t;
  }
  for (const fn of store.listeners) fn(t);
}

export function onThemeChange(fn: (t: Theme) => void) {
  store.listeners.add(fn);
  return () => store.listeners.delete(fn);
}
