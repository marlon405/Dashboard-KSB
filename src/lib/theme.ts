import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'berlin-dashboard.theme';

function initial(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Dunkel ist Standard. Die Wahl wird in localStorage gespeichert (index.html setzt sie vor dem ersten Rendern). */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* ignorieren */ }
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
