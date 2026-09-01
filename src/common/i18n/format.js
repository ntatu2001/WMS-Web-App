// Locale-aware formatting helpers. Pass `lang` ('vi' | 'en') explicitly so these
// stay pure and usable outside React (e.g. Excel export utils).
import { localeTag } from './index';

export const formatDate = (d, lang) => {
  if (d == null || d === '') return '';
  return new Date(d).toLocaleDateString(localeTag(lang));
};

export const formatTime = (d, lang) => {
  if (d == null || d === '') return '';
  return new Date(d).toLocaleTimeString(localeTag(lang));
};

export const formatDateTime = (d, lang) => {
  if (d == null || d === '') return '';
  return new Date(d).toLocaleString(localeTag(lang));
};

export const formatNumber = (n, lang) => Number(n || 0).toLocaleString(localeTag(lang));

// currencySuffix comes from the dictionary ('₫' / 'VND') so it can be localized too.
export const formatCurrency = (n, lang, t) => `${formatNumber(n, lang)} ${t('common.currencySuffix')}`;
