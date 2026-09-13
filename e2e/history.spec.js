import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';

const RECEIPT_LOT = {
  lotNumber: 'LOT001',
  receiptDate: '01/01/2024',
  personName: 'NV A',
  supplierName: 'NCC A',
  warehouseName: 'Kho A',
  warehouseID: 'KHO001',
  lotStatus: 'Done',
};

test.describe('Phân quyền trang Lịch sử', () => {
  test('role Staff không truy cập được /history -> chuyển về /403', async ({ page }) => {
    await loginAs(page, { roles: ['Staff'], targetPath: '/history' });

    await expect(page).toHaveURL(/\/403$/);
  });
});

test.describe('Lịch sử nhập kho', () => {
  test('tìm kiếm theo mã lô -> hiển thị danh sách, chọn 1 lô để xem chi tiết', async ({ page }) => {
    await mockJson(page, '**/Supplier/GetAllSupplierNameId', []);
    await mockJson(page, '**/InventoryLog/GetAllReceiptLotsTracking**', [RECEIPT_LOT]);
    await loginAs(page, { roles: ['Manager'], targetPath: '/history' });

    await expect(page.getByText('Không có lô nhập kho phù hợp.')).toBeVisible();

    await page.getByPlaceholder('Tìm kiếm theo Mã lô/ số PO').fill('LOT001');
    await page.getByRole('button', { name: 'Tìm kiếm' }).click();

    await expect(page.getByText('LOT001')).toBeVisible();
    await expect(page.getByText('Chọn một lô ở danh sách bên trái để xem chi tiết')).toBeVisible();

    await page.getByText('LOT001').click();

    await expect(page.getByText('Chọn một lô ở danh sách bên trái để xem chi tiết')).toHaveCount(0);
    // "Kho A" chỉ xuất hiện ở panel chi tiết bên phải (thẻ lô bên trái không hiển thị kho).
    await expect(page.getByText('Kho A')).toBeVisible();
  });
});
