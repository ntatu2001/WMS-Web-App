// Lightweight i18n — no dependency. Dictionaries are plain nested objects;
// `t(key, vars)` does dotted-path lookup + {placeholder} interpolation.
// Language state lives in Redux (src/store/slices/languageSlice.js) and is read
// by the useTranslation hook, so any component using it re-renders on switch.

import vi from './vi';
import en from './en';

export const dictionaries = { vi, en };
export const SUPPORTED_LANGS = ['vi', 'en'];
export const DEFAULT_LANG = 'vi';

const dig = (obj, key) =>
  key.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

// Resolve a key: current lang → Vietnamese fallback → the key itself.
export function lookup(lang, key) {
  const primary = dig(dictionaries[lang] || dictionaries[DEFAULT_LANG], key);
  if (primary != null) return primary;
  const fallback = dig(dictionaries[DEFAULT_LANG], key);
  return fallback != null ? fallback : key;
}

// Replace {name} tokens. Missing vars are left as `{name}` so they're easy to spot.
export function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

export const localeTag = (lang) => (lang === 'en' ? 'en-US' : 'vi-VN');
