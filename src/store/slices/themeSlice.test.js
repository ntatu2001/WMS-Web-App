import { describe, it, expect, vi } from 'vitest';
import themeReducer, { setThemeMode } from './themeSlice';

describe('themeSlice', () => {
  it('setThemeMode: nhận giá trị hợp lệ và lưu vào localStorage', () => {
    const next = themeReducer({ mode: 'system' }, setThemeMode('dark'));
    expect(next.mode).toBe('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
  });

  it('setThemeMode: giá trị không hợp lệ thì fallback về "system"', () => {
    const next = themeReducer({ mode: 'dark' }, setThemeMode('neon'));
    expect(next.mode).toBe('system');
  });

  it('initial state: đọc themeMode hợp lệ từ localStorage', async () => {
    const { default: freshThemeReducer } = await freshImport(() => {
      localStorage.setItem('themeMode', 'light');
    });
    const state = freshThemeReducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('light');
  });

  it('initial state: themeMode không hợp lệ trong localStorage thì fallback "system"', async () => {
    const { default: freshThemeReducer } = await freshImport(() => {
      localStorage.setItem('themeMode', 'neon');
    });
    const state = freshThemeReducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('system');
  });
});

async function freshImport(seed) {
  vi.resetModules();
  localStorage.clear();
  seed();
  return import('./themeSlice');
}
