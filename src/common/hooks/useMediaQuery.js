import { useEffect, useState } from 'react';
import { BP_SM, BP_TABLET, BP_DESKTOP } from '../styles/breakpoints';

/**
 * Tracks a CSS media query, re-rendering the caller when it changes.
 * Mirrors the matchMedia + addEventListener('change', ...) pattern used by
 * useApplyTheme.js for the OS dark-mode listener.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * Convenience wrapper exposing the app's standard breakpoint booleans.
 * - isMobile: below BP_TABLET (< 768px)
 * - isTablet: BP_TABLET..BP_DESKTOP (768–1023px)
 * - isDesktop: BP_DESKTOP and above (>= 1024px)
 */
export function useBreakpoint() {
  const isMobile = useMediaQuery(`(max-width: ${BP_TABLET - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${BP_DESKTOP}px)`);
  const isSmall = useMediaQuery(`(max-width: ${BP_SM - 1}px)`);

  return {
    isMobile,
    isTablet: !isMobile && !isDesktop,
    isDesktop,
    isSmall,
  };
}
