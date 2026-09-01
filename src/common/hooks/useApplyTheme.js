import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const DARK_QUERY = '(prefers-color-scheme: dark)';

// Resolve the effective theme ('light' | 'dark') from a stored mode.
export const resolveTheme = (mode) => {
  if (mode === 'light' || mode === 'dark') return mode;
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches
    ? 'dark'
    : 'light';
};

/**
 * Applies the current theme mode to <html data-theme>. Call once, near the app root.
 * - Reacts to Redux `theme.mode` changes (instant, no reload).
 * - While mode === 'system', also follows live OS theme changes.
 */
export default function useApplyTheme() {
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(mode);
    };
    apply();

    if (mode !== 'system') return undefined;
    const mql = window.matchMedia(DARK_QUERY);
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [mode]);
}

/**
 * Read-only hook for code that needs the resolved theme as a JS value
 * (ApexCharts, <ToastContainer theme>, react-select styles).
 * Re-renders the caller when mode === 'system' and the OS theme flips.
 */
export function useResolvedTheme() {
  const mode = useSelector((state) => state.theme.mode);
  const [resolved, setResolved] = useState(() => resolveTheme(mode));

  useEffect(() => {
    setResolved(resolveTheme(mode));
    if (mode !== 'system') return undefined;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = () => setResolved(resolveTheme(mode));
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode]);

  return resolved;
}
