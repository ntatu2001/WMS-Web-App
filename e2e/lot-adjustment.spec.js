import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';

const WAREHOUSE = { warehouseName: 'Kho A', warehouseId: 'KHO001' };
const EMPLOYEE = { employeeName: 'NV A', employeeId: 'EMP001' };
const SUBLOT = {
  materialSubLotId: 'SUBLOT1',
  existingQuantity: 10,
  realTimeQuality: 8,
  locationId: 'LOC001',
  subLotStatus: 'Active',
  unitOfMeasure: 'Cái',
};
const MATERIAL = { materialId: 'SP001', materialName: 'Sản phẩm A', properties: [{ propertyName: 'Note', propertyValue: 'Ghi chú demo' }] };

async function mockLotAdjustmentPageData(page) {
  await mockJson(page, '**/Warehouse/GetAllWarehouseNameId', [WAREHOUSE]);
  await mockJson(page, '**/Employee/GetAllEmployeeNameId', [EMPLOYEE]);
  await mockJson(page, '**/MaterialLot/GetLotNumbersByWarehouseId/**', ['LOT001']);
  await mockJson(page, '**/MaterialLot/GetMaterialIdByLotNumber/**', 'SP001');
  await mockJson(page, '**/MaterialSubLot/GetMaterialSubLotsByLotNumber/**', [SUBLOT]);
  await mockJson(page, '**/Material/GetMaterialById/**', MATERIAL);
  await mockJson(page, '**/Material/GetUnitByMaterialId/**', 'Cái');
}

async function selectOption(page, placeholderText, optionText) {
  await page.getByText(placeholderText, { exact: true }).click();
  await page.getByText(optionText, { exact: true }).click();
}

async function gotoLotAdjustment(page, roles = ['Staff']) {
  await mockLotAdjustmentPageData(page);
  await loginAs(page, { roles, targetPath: '/inventory' });
  await expect(page.getByRole('button', { name: 'Tạo yêu cầu' })).toBeVisible();
}

async function fillFullFormAndSelectLot(page) {
  await selectOption(page, 'Chọn loại kho hàng', 'Kho A');
  await selectOption(page, 'Chọn lô hàng kiểm kê', 'LOT001');
  await expect(page.getByText('Sản phẩm A')).toBeVisible();
  await selectOption(page, 'Chọn loại kiểm kê', 'Kiểm kê định kỳ');
  await selectOption(page, 'Chọn lý do kiểm kê', 'Hư hỏng');
  await selectOption(page, 'Chọn nhân viên', 'NV A');
  await page.locator('input[type="datetime-local"]').fill('2024-01-01T08:00');
}

test.describe('Yêu cầu kiểm kê / điều chỉnh tồn kho', () => {
  test('bấm tạo yêu cầu khi chưa chọn gì -> báo đủ lỗi validate', async ({ page }) => {
    await gotoLotAdjustment(page);

    await page.getByRole('button', { name: 'Tạo yêu cầu' }).click();

    await expect(page.getByText('Vui lòng chọn kho hàng')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn lô kiểm kê')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn loại kiểm kê')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn lý do')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn nhân viên')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn ngày thực hiện')).toBeVisible();
  });

  test('điền đầy đủ, tạo yêu cầu rồi duyệt sau khi sửa số lượng thực tế', async ({ page }) => {
    await gotoLotAdjustment(page);
    await mockJson(page, '**/StockTake/CreateNewStockTake', 'ADJ001');
    await mockJson(page, '**/StockTake/UpdateStockTakeCommand', {});

    await fillFullFormAndSelectLot(page);

    const createRequest = page.waitForRequest('**/StockTake/CreateNewStockTake');
    await page.getByRole('button', { name: 'Tạo yêu cầu' }).click();
    const request = await createRequest;
    expect(request.postDataJSON()).toMatchObject({
      warehouseId: 'KHO001',
      employeeId: 'EMP001',
      lotNumber: 'LOT001',
      reason: 'Damaged',
      adjustmentType: 'Periodic',
    });

    const approveButton = page.getByRole('button', { name: 'Duyệt kiểm kê' });
    await expect(approveButton).toBeEnabled();

    await page.locator('tbody input[type="number"]').fill('15');
    const updateRequest = page.waitForRequest('**/StockTake/UpdateStockTakeCommand');
    await approveButton.click();
    const updateReq = await updateRequest;
    expect(updateReq.postDataJSON()).toMatchObject({
      lotNumber: 'LOT001',
      stockTakeId: 'ADJ001',
      materialSubLots: [{ materialSubLotId: 'SUBLOT1', realQuantity: 15 }],
    });

    await expect(page.getByText('Không còn vị trí nào để kiểm kê.')).toBeVisible();
  });

  test('duyệt khi chưa sửa số lượng nào -> báo không có thay đổi, không gọi API', async ({ page }) => {
    await gotoLotAdjustment(page);
    await mockJson(page, '**/StockTake/CreateNewStockTake', 'ADJ001');
    let updateCalled = false;
    await page.route('**/StockTake/UpdateStockTakeCommand', async (route) => {
      updateCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await fillFullFormAndSelectLot(page);
    await page.getByRole('button', { name: 'Tạo yêu cầu' }).click();
    const approveButton = page.getByRole('button', { name: 'Duyệt kiểm kê' });
    await expect(approveButton).toBeEnabled();

    await approveButton.click();

    await expect(page.getByText('Không có thay đổi nào để duyệt kiểm kê')).toBeVisible();
    expect(updateCalled).toBe(false);
  });
});
