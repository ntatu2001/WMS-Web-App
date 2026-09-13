import { describe, it, expect, vi } from 'vitest';
import languageReducer, { setLanguage } from './languageSlice';

describe('languageSlice', () => {
  it('setLanguage: nhận ngôn ngữ hợp lệ và lưu vào localStorage', () => {
    const next = languageReducer({ lang: 'vi' }, setLanguage('en'));
    expect(next.lang).toBe('en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('setLanguage: ngôn ngữ không hỗ trợ thì fallback về DEFAULT_LANG (vi)', () => {
    const next = languageReducer({ lang: 'en' }, setLanguage('fr'));
    expect(next.lang).toBe('vi');
  });

  it('initial state: đọc lang hợp lệ từ localStorage', async () => {
    const { default: freshLanguageReducer } = await freshImport(() => {
      localStorage.setItem('lang', 'en');
    });
    const state = freshLanguageReducer(undefined, { type: '@@INIT' });
    expect(state.lang).toBe('en');
  });

  it('initial state: lang không hỗ trợ trong localStorage thì fallback DEFAULT_LANG', async () => {
    const { default: freshLanguageReducer } = await freshImport(() => {
      localStorage.setItem('lang', 'fr');
    });
    const state = freshLanguageReducer(undefined, { type: '@@INIT' });
    expect(state.lang).toBe('vi');
  });
});

async function freshImport(seed) {
  vi.resetModules();
  localStorage.clear();
  seed();
  return import('./languageSlice');
}
