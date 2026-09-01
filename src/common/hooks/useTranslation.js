import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { lookup, interpolate } from '../i18n';

/**
 * Translation hook. `t(key, vars)` resolves a dotted key from the current
 * language dictionary (falling back to Vietnamese, then the raw key) and
 * interpolates {placeholder} tokens.
 *
 * Any component that calls this subscribes to `state.language.lang`, so the
 * whole subtree re-renders on language switch — no reload needed.
 */
export default function useTranslation() {
  const lang = useSelector((state) => state.language.lang);
  const t = useCallback((key, vars) => interpolate(lookup(lang, key), vars), [lang]);
  return { t, lang };
}
