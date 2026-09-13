import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';

// Dashboard dùng SignalR để nhận cập nhật realtime (xem src/realtime/overviewHub.js) —
// theo kế hoạch, phần push realtime KHÔNG được cover ở E2E (quá phức tạp/brittle khi giả
// lập handshake WebSocket của SignalR), chỉ cover phần dữ liệu tĩnh tải qua 2 REST API khi
// vào trang. Kết nối SignalR thật sẽ tự fail êm re (catch nuốt lỗi, tự lên lịch retry) nên
// không cần mock riêng endpoint negotiate.
const OVERVIEW_DATA = {
  receiptOverview: { totalReceipts: 12, completeReceipts: 9 },
  issueOverview: { totalIssues: 7, completeIssues: 4 },
  stockTakeOverview: { totalStockTakes: 3, periodicStockTakes: 2 },
  totalOverview: { totalReceipts: 12, totalIssues: 7, totalStockTakes: 3 },
};

async function mockDashboardData(page) {
  await mockJson(page, '**/Overview/GetInventoryActivityStats**', OVERVIEW_DATA);
  await mockJson(page, '**/Overview/GetWarehouseInventoryMovementStats**', {});
}

test.describe('Phân quyền trang Dashboard', () => {
  test('role Manager không truy cập được /dashboard -> chuyển về /403', async ({ page }) => {
    await mockDashboardData(page);
    await loginAs(page, { roles: ['Manager'], targetPath: '/dashboard' });

    await expect(page).toHaveURL(/\/403$/);
  });
});

test.describe('Dashboard — dữ liệu tổng quan', () => {
  test('Admin xem được số liệu tổng quan tải từ API', async ({ page }) => {
    await mockDashboardData(page);
    await loginAs(page, { roles: ['Admin'], targetPath: '/dashboard' });

    // "Nhập kho" cũng trùng tên mục sidebar — scope vào khu vực nội dung chính (<main>).
    const main = page.getByRole('main');
    await expect(main.getByText('Nhập kho', { exact: true })).toBeVisible();
    await expect(main.getByText('Xuất kho', { exact: true })).toBeVisible();
    await expect(main.getByText('Kiểm kê', { exact: true }).first()).toBeVisible();

    // Mỗi tổng dùng 1 số riêng biệt (12/7/3) để tránh trùng với số liệu khác trên trang.
    await expect(main.getByText('12', { exact: true }).first()).toBeVisible();
    await expect(main.getByText('7', { exact: true }).first()).toBeVisible();
  });
});
