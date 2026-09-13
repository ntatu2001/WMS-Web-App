import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import Appearance from './Appearance';
import { createTestStore } from '../../../../test/test-utils';

function renderAppearance(preloadedState, onCancel = vi.fn()) {
  const store = createTestStore(preloadedState);
  render(
    <Provider store={store}>
      <Appearance onCancel={onCancel} />
    </Provider>
  );
  return store;
}

describe('Appearance', () => {
  it('đánh dấu đúng option theme/ngôn ngữ hiện tại (aria-checked)', () => {
    // labelKey của theme (Sáng/Tối/Theo hệ thống) phụ thuộc ngôn ngữ UI hiện tại,
    // còn tên ngôn ngữ (Tiếng Việt/English) là literal cố định ở cả 2 dictionary.
    renderAppearance({ theme: { mode: 'dark' }, language: { lang: 'vi' } });

    expect(screen.getByRole('radio', { name: /Tối/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Sáng/ })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: /Tiếng Việt/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /English/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('chọn theme "Sáng" thì dispatch setThemeMode và cập nhật localStorage', async () => {
    const user = userEvent.setup();
    const store = renderAppearance({ theme: { mode: 'dark' }, language: { lang: 'vi' } });

    await user.click(screen.getByRole('radio', { name: /Sáng/ }));

    expect(store.getState().theme.mode).toBe('light');
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  it('chọn ngôn ngữ English thì dispatch setLanguage và cập nhật localStorage', async () => {
    const user = userEvent.setup();
    const store = renderAppearance({ theme: { mode: 'system' }, language: { lang: 'vi' } });

    await user.click(screen.getByRole('radio', { name: /English/ }));

    expect(store.getState().language.lang).toBe('en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('bấm nút đóng thì gọi onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderAppearance({ theme: { mode: 'system' }, language: { lang: 'vi' } }, onCancel);

    await user.click(screen.getByRole('button', { name: 'Đóng' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
