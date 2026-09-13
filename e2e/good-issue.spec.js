import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';
import { buildXlsxBuffer } from './fixtures/xlsx.js';

const WAREHOUSE = { warehouseName: 'Kho A', warehouseId: 'KHO001' };
const CUSTOMER = { customerName: 'KH A', customerId: 'CUS001' };
const EMPLOYEE = { employeeName: 'NV A', employeeId: 'EMP001' };
const MATERIAL = { materialName: 'Sản phẩm A', materialId: 'SP001' };

async function mockCreateIssuePageData(page) {
  await mockJson(page, '**/Warehouse/GetAllWarehouseNameId', [WAREHOUSE]);
  await mockJson(page, '**/Customer/GetAllCustomerNameId', [CUSTOMER]);
  await mockJson(page, '**/Employee/GetAllEmployeeNameId', [EMPLOYEE]);
  await mockJson(page, '**/Material/GetMaterialsByWarehouseIdAndMaterialLot/**', [MATERIAL]);
  await mockJson(page, '**/Material/GetUnitByMaterialId/**', 'Cái');
  await mockJson(page, '**/MaterialLot/GetLotNumbersByMaterialId/**', ['LOT001']);
  await mockJson(page, '**/MaterialLot/GetQuantityByMaterialLotId/**', { availableQuantity: 100 });
}

async function selectOption(page, placeholderText, optionText) {
  await page.getByText(placeholderText, { exact: true }).click();
  await page.getByText(optionText, { exact: true }).click();
}

// "Tên sản phẩm" trùng tiêu đề cột trong <thead> — scope vào <tbody>. Option hiển thị
// trong menu có dạng "[LOT001] Sản phẩm A" (formatOptionLabel thêm tiền tố mã lô khi
// context === 'menu' — xem CreateGoodIssue.jsx), nên match theo substring thay vì exact.
async function selectRowProduct(page, optionText) {
  await page.locator('tbody').getByText('Tên sản phẩm', { exact: true }).click();
  await page.getByText(optionText).click();
}

// "Mã lô/Số PO" cũng trùng tiêu đề cột trong <thead> — scope vào <tbody>.
async function selectRowLot(page, optionText) {
  await page.locator('tbody').getByText('Mã lô/Số PO', { exact: true }).click();
  await page.getByText(optionText, { exact: true }).click();
}

async function gotoCreateIssue(page, roles = ['Staff']) {
  await mockCreateIssuePageData(page);
  await loginAs(page, { roles, targetPath: '/goodissue' });
  await expect(page.getByRole('button', { name: 'Tạo phiếu xuất kho' })).toBeVisible();
}

test.describe('Tạo phiếu xuất kho — nhập tay', () => {
  test('điền đủ thông tin và tạo phiếu thành công', async ({ page }) => {
    await gotoCreateIssue(page);
    await mockJson(page, '**/InventoryIssue/CreateInventoryIssue', 'ISSUE001');

    await selectOption(page, 'Chọn loại kho hàng', 'Kho A');
    await selectRowProduct(page, 'Sản phẩm A');
    await selectRowLot(page, 'LOT001');
    await page.getByPlaceholder('SL xuất').fill('10');
    await page.locator('input[type="datetime-local"]').fill('2024-01-01T08:00');
    await selectOption(page, 'Chọn khách hàng', 'KH A');
    await selectOption(page, 'Chọn nhân viên', 'NV A');

    const createRequest = page.waitForRequest('**/InventoryIssue/CreateInventoryIssue');
    await page.getByRole('button', { name: 'Tạo phiếu xuất kho' }).click();
    const request = await createRequest;
    const payload = request.postDataJSON();

    expect(payload).toMatchObject({
      warehouseId: 'KHO001',
      customerId: 'CUS001',
      employeeId: 'EMP001',
      entries: [{ materialName: 'Sản phẩm A', materialId: 'SP001', unit: 'Cái', purchaseOrderNumber: 'LOT001', requestedQuantity: '10' }],
    });
  });

  test('bỏ trống toàn bộ và bấm tạo phiếu -> báo đủ lỗi validate', async ({ page }) => {
    await gotoCreateIssue(page);

    await page.getByRole('button', { name: 'Tạo phiếu xuất kho' }).click();

    await expect(page.getByText('Vui lòng chọn kho hàng')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn khách hàng')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn nhân viên')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn ngày xuất kho')).toBeVisible();
  });
});

test.describe('Tạo phiếu xuất kho — import Excel', () => {
  test('import file đúng mẫu -> điền form và hiện thông báo thành công', async ({ page }) => {
    await gotoCreateIssue(page);
    const buffer = buildXlsxBuffer('Phieu Xuat Kho', [
      ['PHIẾU XUẤT KHO'],
      ['', 'Kho hàng (*)', 'Kho A'],
      ['', 'Mã kho hàng (*)', 'KHO001'],
      ['', 'Khách hàng (*)', 'KH A'],
      ['', 'Nhân viên (*)', 'NV A'],
      ['', 'Ngày xuất kho (*)', '01/01/2024'],
      [],
      ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'ĐVT', 'Mã lô', 'SL xuất', 'Ghi chú'],
      [1, 'Sản phẩm A', 'SP001', 'Cái', 'LOT001', '10', ''],
    ]);

    await page.setInputFiles('input[type="file"]', {
      name: 'phieu_xuat.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });

    await expect(page.getByText(/Đã nhập phiếu và 1 dòng sản phẩm/)).toBeVisible();
    await expect(page.getByText('Kho A')).toBeVisible();
    await expect(page.getByText('KH A')).toBeVisible();
  });

  test('import file có dòng vượt quá tồn kho -> hiện banner lỗi cụ thể theo dòng', async ({ page }) => {
    await gotoCreateIssue(page);
    await mockJson(page, '**/MaterialLot/GetQuantityByMaterialLotId/**', { availableQuantity: 5 });
    const buffer = buildXlsxBuffer('Phieu Xuat Kho', [
      ['PHIẾU XUẤT KHO'],
      ['', 'Kho hàng (*)', 'Kho A'],
      ['', 'Mã kho hàng (*)', 'KHO001'],
      ['', 'Khách hàng (*)', 'KH A'],
      ['', 'Nhân viên (*)', 'NV A'],
      ['', 'Ngày xuất kho (*)', '01/01/2024'],
      [],
      ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'ĐVT', 'Mã lô', 'SL xuất', 'Ghi chú'],
      [1, 'Sản phẩm A', 'SP001', 'Cái', 'LOT001', '10', ''],
    ]);

    await page.setInputFiles('input[type="file"]', {
      name: 'phieu_xuat.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });

    await expect(page.getByText('Dòng 9: SL xuất vượt quá tồn kho (5).')).toBeVisible();
  });
});
