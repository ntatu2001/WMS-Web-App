import { describe, it, expect } from 'vitest';
import { menuItems } from '../config/menuConfig';
import { lookup, SUPPORTED_LANGS } from './index';

// Gom mọi titleKey (kể cả subItems) khai báo trong menuConfig.js — regression test
// chống thiếu key dịch khi thêm mục menu mới mà quên cập nhật vi.js/en.js.
function collectTitleKeys(items) {
  return items.flatMap((item) => [
    item.titleKey,
    ...(item.subItems ? collectTitleKeys(item.subItems) : []),
  ]);
}

const titleKeys = collectTitleKeys(menuItems);

describe('i18n key coverage cho menuConfig', () => {
  it('menuConfig có khai báo ít nhất 1 titleKey (sanity check)', () => {
    expect(titleKeys.length).toBeGreaterThan(0);
  });

  it.each(titleKeys)('key "%s" phải resolve ra bản dịch (không rơi về chính key) ở mọi ngôn ngữ hỗ trợ', (key) => {
    for (const lang of SUPPORTED_LANGS) {
      const resolved = lookup(lang, key);
      expect(resolved).not.toBe(key);
      expect(typeof resolved).toBe('string');
      expect(resolved.trim().length).toBeGreaterThan(0);
    }
  });
});
