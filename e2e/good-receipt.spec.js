import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';
import { buildXlsxBuffer } from './fixtures/xlsx.js';

const WAREHOUSE = { warehouseName: 'Kho A', warehouseId: 'KHO001' };
const SUPPLIER = { supplierName: 'NCC A', supplierId: 'SUP001' };
const EMPLOYEE = { employeeName: 'NV A', employeeId: 'EMP001' };
const MATERIAL = { materialName: 'Sản phẩm A', materialId: 'SP001' };

async function mockCreateReceiptPageData(page) {
  await mockJson(page, '**/Warehouse/GetAllWarehouseNameId', [WAREHOUSE]);
  await mockJson(page, '**/Supplier/GetAllSupplierNameId', [SUPPLIER]);
  await mockJson(page, '**/Employee/GetAllEmployeeNameId', [EMPLOYEE]);
  await mockJson(page, '**/InventoryReceiptLot/GetAllReceiptLotIds', []);
  await mockJson(page, '**/Material/GetMaterialsByWarehouseId/**', [MATERIAL]);
  await mockJson(page, '**/Material/GetUnitByMaterialId/**', 'Cái');
}

async function selectOption(page, placeholderText, optionText) {
  await page.getByText(placeholderText, { exact: true }).click();
  await page.getByText(optionText, { exact: true }).click();
}

// "Tên sản phẩm" trùng với tiêu đề cột trong bảng (<thead>) — scope vào <tbody> để chỉ
// nhắm đúng placeholder của ô Select chọn sản phẩm ở dòng đầu tiên.
async function selectRowProduct(page, optionText) {
  await page.locator('tbody').getByText('Tên sản phẩm', { exact: true }).click();
  await page.getByText(optionText, { exact: true }).click();
}

async function gotoCreateReceipt(page, roles = ['Staff']) {
  await mockCreateReceiptPageData(page);
  await loginAs(page, { roles, targetPath: '/goodreceipt' });
  await expect(page.getByRole('button', { name: 'Tạo phiếu nhập kho' })).toBeVisible();
}

test.describe('Tạo phiếu nhập kho — nhập tay', () => {
  test('điền đủ thông tin và tạo phiếu thành công', async ({ page }) => {
    await gotoCreateReceipt(page);
    await mockJson(page, '**/InventoryReceipt/CreateReceipt', 'RECEIPT001');

    await selectOption(page, 'Chọn loại kho hàng', 'Kho A');
    await selectRowProduct(page, 'Sản phẩm A');
    await page.getByPlaceholder('Mã lô/Số PO').fill('LOT001');
    await page.getByPlaceholder('SL nhập').fill('10');
    await page.locator('input[type="datetime-local"]').fill('2024-01-01T08:00');
    await selectOption(page, 'Chọn nhà cung cấp', 'NCC A');
    await selectOption(page, 'Chọn nhân viên', 'NV A');

    const createRequest = page.waitForRequest('**/InventoryReceipt/CreateReceipt');
    await page.getByRole('button', { name: 'Tạo phiếu nhập kho' }).click();
    const request = await createRequest;
    const payload = request.postDataJSON();

    expect(payload).toMatchObject({
      warehouseId: 'KHO001',
      supplierId: 'SUP001',
      employeeId: 'EMP001',
      entries: [{ materialName: 'Sản phẩm A', materialId: 'SP001', unit: 'Cái', lotNumber: 'LOT001', importedQuantity: '10' }],
    });
  });

  test('bỏ trống toàn bộ và bấm tạo phiếu -> báo đủ lỗi validate', async ({ page }) => {
    await gotoCreateReceipt(page);

    await page.getByRole('button', { name: 'Tạo phiếu nhập kho' }).click();

    await expect(page.getByText('Vui lòng chọn kho hàng')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn nhà cung cấp')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn nhân viên')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn ngày nhập kho')).toBeVisible();
  });
});

test.describe('Tạo phiếu nhập kho — import Excel', () => {
  test('import file đúng mẫu -> điền form và hiện thông báo thành công', async ({ page }) => {
    await gotoCreateReceipt(page);
    const buffer = buildXlsxBuffer('Phieu Nhap Kho', [
      ['PHIẾU NHẬP KHO'],
      ['', 'Kho hàng (*)', 'Kho A'],
      ['', 'Mã kho hàng (*)', 'KHO001'],
      ['', 'Nhà cung cấp (*)', 'NCC A'],
      ['', 'Nhân viên (*)', 'NV A'],
      ['', 'Ngày nhập kho (*)', '01/01/2024'],
      [],
      ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'ĐVT', 'Mã lô', 'SL nhập', 'Ghi chú'],
      [1, 'Sản phẩm A', 'SP001', 'Cái', 'LOT001', '10', ''],
    ]);

    await page.setInputFiles('input[type="file"]', {
      name: 'phieu_nhap.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });

    await expect(page.getByText(/Đã nhập phiếu và 1 dòng sản phẩm/)).toBeVisible();
    await expect(page.getByText('Kho A')).toBeVisible();
    await expect(page.getByText('NCC A')).toBeVisible();
  });

  test('import file sai mẫu (thiếu sheet) -> hiện banner lỗi, không đổi form', async ({ page }) => {
    await gotoCreateReceipt(page);
    const buffer = buildXlsxBuffer('Sheet Sai Ten', [['a', 'b', 'c']]);

    await page.setInputFiles('input[type="file"]', {
      name: 'phieu_nhap.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });

    await expect(page.getByText('Không tìm thấy sheet "Phieu Nhap Kho" trong file. Vui lòng dùng đúng file mẫu.')).toBeVisible();
  });
});
