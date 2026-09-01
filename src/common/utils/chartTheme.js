/**
 * Shared ApexCharts theme fragment. Merge (shallow-per-key) into any chart's
 * options so charts read correctly on both light and dark surfaces.
 *
 * Pass the resolved theme ('light' | 'dark') from useResolvedTheme().
 * CSS custom properties resolve fine inside ApexCharts style strings.
 */
export function buildChartTheme(resolvedTheme = 'light') {
  return {
    theme: { mode: resolvedTheme },
    chart: {
      background: 'transparent',
      foreColor: 'var(--color-text-muted)',
    },
    grid: {
      borderColor: 'var(--color-border)',
    },
    tooltip: {
      theme: resolvedTheme,
    },
    legend: {
      labels: { colors: 'var(--color-text)' },
    },
  };
}

/** Deep-ish merge helper: overlays `patch` onto `base` one level into nested objects. */
export function mergeChartOptions(base = {}, patch = {}) {
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const b = base[key];
    const p = patch[key];
    if (b && p && typeof b === 'object' && typeof p === 'object' && !Array.isArray(b) && !Array.isArray(p)) {
      out[key] = { ...b, ...p };
    } else {
      out[key] = p;
    }
  }
  return out;
}
