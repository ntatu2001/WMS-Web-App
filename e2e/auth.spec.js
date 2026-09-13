import { test, expect } from '@playwright/test';

// Smoke test: xác nhận pipeline E2E (webServer + browser + report) chạy được
// end-to-end. Trang /login là route công khai nên không cần mock API nào.
test('trang đăng nhập hiển thị đúng form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByPlaceholder('Tên đăng nhập')).toBeVisible();
  await expect(page.getByPlaceholder('Mật khẩu')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ĐĂNG NHẬP' })).toBeVisible();
});

test('truy cập route được bảo vệ khi chưa đăng nhập sẽ chuyển hướng về /login', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);
});
