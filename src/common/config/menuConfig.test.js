import { describe, it, expect } from 'vitest';
import { getDefaultRouteForRoles, isMenuItemVisible } from './menuConfig';

describe('getDefaultRouteForRoles', () => {
  it('trả về /dashboard cho Admin', () => {
    expect(getDefaultRouteForRoles(['Admin'])).toBe('/dashboard');
  });

  it('trả về /storage cho Manager', () => {
    expect(getDefaultRouteForRoles(['Manager'])).toBe('/storage');
  });

  it('trả về /goodreceipt cho role không có mục giới hạn (vd Staff)', () => {
    expect(getDefaultRouteForRoles(['Staff'])).toBe('/goodreceipt');
  });

  it('trả về /goodreceipt khi danh sách role rỗng', () => {
    expect(getDefaultRouteForRoles([])).toBe('/goodreceipt');
  });
});

describe('isMenuItemVisible', () => {
  it('mục không có roles thì hiển thị cho mọi role', () => {
    expect(isMenuItemVisible({ path: '/goodreceipt' }, [])).toBe(true);
  });

  it('mục có roles chỉ hiển thị khi role khớp', () => {
    const item = { path: '/dashboard', roles: ['Admin'] };
    expect(isMenuItemVisible(item, ['Admin'])).toBe(true);
    expect(isMenuItemVisible(item, ['Manager'])).toBe(false);
  });
});
