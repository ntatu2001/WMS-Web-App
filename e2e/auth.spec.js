import { test, expect } from '@playwright/test';
import { mockJson, mockErrorEnvelope } from './fixtures/mockApi.js';
import { mockAuthLoginSuccess, mockAuthLoginFailure, mockAuthRefresh, mockAuthRefreshFailure, loginAs } from './fixtures/auth.js';

test.describe('Trang đăng nhập', () => {
  test('hiển thị đúng form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByPlaceholder('Tên đăng nhập')).toBeVisible();
    await expect(page.getByPlaceholder('Mật khẩu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ĐĂNG NHẬP' })).toBeVisible();
  });

  test('đăng nhập thành công role Admin -> chuyển đến /dashboard', async ({ page }) => {
    await mockAuthLoginSuccess(page, { roles: ['Admin'] });
    await page.goto('/login');

    await page.getByPlaceholder('Tên đăng nhập').fill('admin');
    await page.getByPlaceholder('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();

    await page.waitForURL('**/dashboard');
  });

  test('đăng nhập thành công role Manager -> chuyển đến /storage', async ({ page }) => {
    await mockAuthLoginSuccess(page, { roles: ['Manager'] });
    await page.goto('/login');

    await page.getByPlaceholder('Tên đăng nhập').fill('manager');
    await page.getByPlaceholder('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();

    await page.waitForURL('**/storage');
  });

  test('đăng nhập thành công role không có mục riêng (Staff) -> chuyển đến /goodreceipt', async ({ page }) => {
    await mockAuthLoginSuccess(page, { roles: ['Staff'] });
    await page.goto('/login');

    await page.getByPlaceholder('Tên đăng nhập').fill('staff');
    await page.getByPlaceholder('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();

    await page.waitForURL('**/goodreceipt');
  });

  test('đăng nhập thất bại -> hiện lỗi, ở lại trang login', async ({ page }) => {
    await mockAuthLoginFailure(page, { message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    await page.goto('/login');

    await page.getByPlaceholder('Tên đăng nhập').fill('admin');
    await page.getByPlaceholder('Mật khẩu').fill('wrongpass');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();

    await expect(page.getByText('Tên đăng nhập hoặc mật khẩu không đúng')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Phân quyền theo route', () => {
  test('truy cập route được bảo vệ khi chưa đăng nhập -> chuyển về /login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('đăng nhập role Staff nhưng vào thẳng /dashboard (Admin-only) -> chuyển về /403', async ({ page }) => {
    await loginAs(page, { roles: ['Staff'], targetPath: '/dashboard' });

    await expect(page).toHaveURL(/\/403$/);
    await expect(page.getByText('Bạn không có quyền truy cập chức năng này.')).toBeVisible();
  });

  test('trang 403 -> bấm "Về trang chủ" điều hướng đúng route mặc định của role', async ({ page }) => {
    await loginAs(page, { roles: ['Manager'], targetPath: '/dashboard' });
    await expect(page).toHaveURL(/\/403$/);

    await page.getByRole('button', { name: 'Về trang chủ' }).click();

    await page.waitForURL('**/storage');
  });
});

test.describe('Phiên đăng nhập', () => {
  test('F5 lại trang khi đã đăng nhập từ trước vẫn giữ phiên (refresh ngầm qua LoginGuard)', async ({ page }) => {
    await loginAs(page, { roles: ['Admin'], targetPath: '/dashboard' });

    await expect(page).toHaveURL(/\/dashboard$/);
    await page.reload();

    // Không bị đá về /login dù accessToken (chỉ sống trong Redux memory) đã mất sau reload.
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('access token hết hạn (401) giữa chừng -> tự refresh rồi thử lại request gốc thành công', async ({ page }) => {
    await mockAuthRefresh(page, { roles: ['Staff'] });

    let warehouseCallCount = 0;
    await page.route('**/Warehouse/GetAllWarehouseNameId', async (route) => {
      warehouseCallCount += 1;
      if (warehouseCallCount === 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ code: 'TokenExpired', message: 'Access token expired', detail: '' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ warehouseName: 'Kho A', warehouseId: 'KHO001' }]),
        });
      }
    });
    await mockJson(page, '**/Supplier/GetAllSupplierNameId', []);
    await mockJson(page, '**/Employee/GetAllEmployeeNameId', []);
    await mockJson(page, '**/InventoryReceiptLot/GetAllReceiptLotIds', []);

    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'seed-refresh-token');
      localStorage.setItem('userName', 'demo');
    });
    await page.goto('/goodreceipt');

    await expect.poll(() => warehouseCallCount).toBe(2);
    // Vẫn ở lại trang (không bị đá về /login) vì request gốc cuối cùng thành công.
    await expect(page).toHaveURL(/\/goodreceipt$/);
  });

  test('access token hết hạn và refresh cũng thất bại -> tự đăng xuất và về /login', async ({ page }) => {
    await mockAuthLoginSuccess(page, { roles: ['Staff'] });
    await mockAuthRefreshFailure(page);
    await mockErrorEnvelope(
      page,
      '**/Warehouse/GetAllWarehouseNameId',
      { code: 'TokenExpired', message: 'Access token expired' },
      { status: 401 }
    );

    await page.goto('/login');
    await page.getByPlaceholder('Tên đăng nhập').fill('staff');
    await page.getByPlaceholder('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();
    await page.waitForURL('**/goodreceipt');

    await page.waitForURL('**/login');
    // window.location.href = '/login' load lại toàn bộ document nên execution context có
    // thể bị huỷ ngay sau waitForURL — dùng waitForFunction (tự retry qua context mới)
    // thay vì evaluate 1 lần, để không bị "execution context destroyed".
    await page.waitForFunction(() => localStorage.getItem('refreshToken') === null);
  });

  test('đăng xuất thủ công qua menu Cài đặt -> xoá phiên và về /login', async ({ page }) => {
    await mockJson(page, '**/Auth/Logout', {});
    await loginAs(page, { roles: ['Admin'], targetPath: '/dashboard' });

    await page.getByText('Cài đặt').click();
    await page.getByRole('link', { name: 'Đăng xuất' }).click();
    await page.getByRole('button', { name: 'Đăng xuất' }).click();

    await page.waitForURL('**/login');
    // Logout.jsx gọi navigate('/login') rồi window.location.reload() ngay sau đó — dùng
    // waitForFunction (tự retry qua context mới) thay vì evaluate 1 lần.
    await page.waitForFunction(() => localStorage.getItem('refreshToken') === null);
  });
});
