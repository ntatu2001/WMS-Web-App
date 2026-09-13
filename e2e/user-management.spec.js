import { test, expect } from '@playwright/test';
import { mockJson, mockErrorEnvelope } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';

async function openUserManagement(page, roles = ['Admin']) {
  await mockJson(page, '**/Employee/GetAllEmployees**', { results: [], totalItems: 0 });
  // /goodreceipt mở cho mọi role đã đăng nhập (không riêng Admin) — dùng làm điểm vào
  // chung để mở menu Cài đặt, tránh trường hợp Manager/Staff bị chặn ở /dashboard trước
  // khi kịp thấy sidebar (trang /403 không có sidebar). Mock đủ 4 API GetApi của
  // CreateGoodReceipt để tránh lỗi/toast gây detach lại DOM giữa chừng.
  await mockJson(page, '**/Warehouse/GetAllWarehouseNameId', []);
  await mockJson(page, '**/Supplier/GetAllSupplierNameId', []);
  await mockJson(page, '**/Employee/GetAllEmployeeNameId', []);
  await mockJson(page, '**/InventoryReceiptLot/GetAllReceiptLotIds', []);
  await loginAs(page, { roles, targetPath: '/goodreceipt' });
  await page.getByText('Cài đặt', { exact: true }).click();
}

test.describe('Quản lý người dùng (Admin-only)', () => {
  test('role Manager không thấy mục "Tạo tài khoản" trong menu Cài đặt', async ({ page }) => {
    await openUserManagement(page, ['Manager']);

    await expect(page.getByRole('link', { name: 'Tạo tài khoản mới' })).toHaveCount(0);
  });

  test('role Manager vào thẳng URL /setting/users -> chuyển về /403', async ({ page }) => {
    await mockJson(page, '**/Employee/GetAllEmployees**', { results: [], totalItems: 0 });
    await loginAs(page, { roles: ['Manager'], targetPath: '/setting/users' });

    await expect(page).toHaveURL(/\/403$/);
  });

  test('Admin tạo tài khoản mới thành công', async ({ page }) => {
    await openUserManagement(page, ['Admin']);
    await mockJson(page, '**/Auth/CreateUser', {});

    await page.getByRole('link', { name: 'Tạo tài khoản mới' }).click();
    await page.locator('#userName').fill('newuser');
    await page.locator('#email').fill('newuser@company.com');
    await page.locator('#password').fill('password123');
    await page.getByText('Admin', { exact: true }).click();

    const createRequest = page.waitForRequest('**/Auth/CreateUser');
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    const payload = (await createRequest).postDataJSON();

    expect(payload).toMatchObject({ userName: 'newuser', email: 'newuser@company.com', roles: ['Admin'] });
    await expect(page.getByText('Tạo tài khoản thành công!')).toBeVisible();
  });

  test('tạo tài khoản trùng username -> hiện lỗi từ backend', async ({ page }) => {
    await openUserManagement(page, ['Admin']);
    await mockErrorEnvelope(page, '**/Auth/CreateUser', { code: 'DuplicateUserName', message: 'Tên đăng nhập đã tồn tại' });

    await page.getByRole('link', { name: 'Tạo tài khoản mới' }).click();
    await page.locator('#userName').fill('existinguser');
    await page.locator('#email').fill('existinguser@company.com');
    await page.locator('#password').fill('password123');
    await page.getByText('Manager', { exact: true }).click();
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();

    await expect(page.getByText('Tên đăng nhập đã tồn tại')).toBeVisible();
  });

  test('bỏ trống trường bắt buộc -> báo lỗi validate, không gọi API', async ({ page }) => {
    await openUserManagement(page, ['Admin']);

    await page.getByRole('link', { name: 'Tạo tài khoản mới' }).click();
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();

    await expect(page.getByText('Vui lòng điền đầy đủ tên đăng nhập, email, mật khẩu và chọn 1 role.')).toBeVisible();
  });
});
