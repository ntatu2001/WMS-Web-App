import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';

async function gotoGoodReceiptAndOpenAppearance(page) {
  await mockJson(page, '**/Warehouse/GetAllWarehouseNameId', []);
  await mockJson(page, '**/Supplier/GetAllSupplierNameId', []);
  await mockJson(page, '**/Employee/GetAllEmployeeNameId', []);
  await mockJson(page, '**/InventoryReceiptLot/GetAllReceiptLotIds', []);
  await loginAs(page, { roles: ['Staff'], targetPath: '/goodreceipt' });
  await expect(page.getByRole('button', { name: 'Tạo phiếu nhập kho' })).toBeVisible();
  await page.getByText('Cài đặt', { exact: true }).click();
  await page.getByRole('link', { name: 'Giao diện & Ngôn ngữ' }).click();
}

test.describe('Cài đặt — Giao diện & Ngôn ngữ', () => {
  test('đổi sang chế độ Tối -> áp dụng ngay và giữ nguyên sau khi F5', async ({ page }) => {
    await gotoGoodReceiptAndOpenAppearance(page);

    await page.getByRole('radio', { name: /Tối/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('đổi ngôn ngữ sang English -> giao diện đổi ngôn ngữ và giữ nguyên sau khi F5', async ({ page }) => {
    await gotoGoodReceiptAndOpenAppearance(page);

    await page.getByRole('radio', { name: 'English Display the whole application in English.' }).click();
    await expect(page.getByText('Appearance & Language').first()).toBeVisible();

    // Đóng overlay về /goodreceipt trước khi F5 — F5 ngay lúc đang ở /setting/appearance
    // sẽ không thấy nội dung bên dưới do lastAccessedRoute reset về null (đúng theo giới
    // hạn đã biết của cơ chế overlay khi vào thẳng URL, xem test bên dưới), không phải do
    // ngôn ngữ không được lưu.
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('button', { name: 'Create receipt' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Create receipt' })).toBeVisible();
  });

  test('overlay Cài đặt hiển thị đè lên nội dung trang trước đó, đóng lại thì quay về đúng trang', async ({ page }) => {
    await gotoGoodReceiptAndOpenAppearance(page);

    // Nội dung /goodreceipt vẫn còn hiển thị phía dưới overlay (App.jsx render theo
    // lastAccessedRoute.sidebarContent thay vì unmount khi vào /setting/*).
    await expect(page.getByRole('button', { name: 'Tạo phiếu nhập kho' })).toBeVisible();
    await expect(page.getByText('Giao diện & Ngôn ngữ').first()).toBeVisible();

    await page.getByRole('button', { name: 'Đóng' }).click();

    await expect(page).toHaveURL(/\/goodreceipt$/);
    await expect(page.getByRole('button', { name: 'Tạo phiếu nhập kho' })).toBeVisible();
  });
});
