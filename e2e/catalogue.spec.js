import { test, expect } from '@playwright/test';
import { mockJson } from './fixtures/mockApi.js';
import { loginAs } from './fixtures/auth.js';

const EMPLOYEE_CLASS = { employeeClassId: 'EC001', employeeClassName: 'Thủ kho' };
const EMPLOYEE = {
  employeeName: 'Nguyễn Văn A',
  employeeId: 'EMP001',
  employeeCLassId: 'EC001',
  employeePropertyDTOs: [],
};

async function mockCatalogueBase(page) {
  await mockJson(page, '**/EmployeeClass/GetAllEmployeeClassNameId', [EMPLOYEE_CLASS]);
  await mockJson(page, '**/EmployeeClass/GetAllEmployeeClasses', [EMPLOYEE_CLASS]);
  await mockJson(page, '**/Employee/GetAllEmployees**', { results: [EMPLOYEE], totalItems: 1 });
  await mockJson(page, '**/Material/GetAllMaterials**', { results: [], totalItems: 0 });
  await mockJson(page, '**/MaterialClass/GetAllMaterialClassNameId', []);
  await mockJson(page, '**/Location/GetAllLocations**', { results: [], totalItems: 0 });
  await mockJson(page, '**/Warehouse/GetAllWarehouseNameId', []);
}

test.describe('Phân quyền trang Danh mục', () => {
  test('role Staff không truy cập được /catalogue -> chuyển về /403', async ({ page }) => {
    await mockCatalogueBase(page);
    await loginAs(page, { roles: ['Staff'], targetPath: '/catalogue' });

    await expect(page).toHaveURL(/\/403$/);
  });

  test('role Manager truy cập được /catalogue', async ({ page }) => {
    await mockCatalogueBase(page);
    await loginAs(page, { roles: ['Manager'], targetPath: '/catalogue' });

    await expect(page).toHaveURL(/\/catalogue$/);
    await expect(page.getByText('Danh sách sản phẩm')).toBeVisible();
  });
});

test.describe('Danh mục — Nhân viên', () => {
  test('Manager xem được danh sách nhưng không thấy mục Tạo mới nhân viên', async ({ page }) => {
    await mockCatalogueBase(page);
    await loginAs(page, { roles: ['Manager'], targetPath: '/catalogue' });
    await page.getByText('Nhân viên', { exact: true }).click();

    await expect(page.getByText('Nguyễn Văn A')).toBeVisible();
    await expect(page.getByText('Tạo mới nhân viên')).toHaveCount(0);
  });

  test('Admin tạo mới nhân viên thành công', async ({ page }) => {
    await mockCatalogueBase(page);
    await mockJson(page, '**/Employee/CreateNewEmployee', {});
    await loginAs(page, { roles: ['Admin'], targetPath: '/catalogue' });
    await page.getByText('Nhân viên', { exact: true }).click();

    await page.getByRole('button', { name: 'Hiện' }).first().click();
    await page.locator('input[name="employeeName"]').fill('Trần Thị B');
    await page.locator('input[name="employeeId"]').fill('EMP002');
    await page.getByText('Chọn chức vụ', { exact: true }).click();
    // "Thủ kho" cũng xuất hiện trong bảng danh sách (dữ liệu mock) — scope vào option của dropdown.
    await page.getByRole('option', { name: 'Thủ kho' }).click();

    const createRequest = page.waitForRequest('**/Employee/CreateNewEmployee');
    await page.getByRole('button', { name: 'Tạo mới nhân viên' }).click();
    const payload = (await createRequest).postDataJSON();

    expect(payload).toMatchObject({ employeeName: 'Trần Thị B', employeeId: 'EMP002', employeeClassId: 'EC001' });
    await expect(page.getByText('Nhân viên đã được tạo thành công!')).toBeVisible();
  });

  test('Admin bỏ trống trường bắt buộc -> báo lỗi validate, không gọi API', async ({ page }) => {
    await mockCatalogueBase(page);
    await loginAs(page, { roles: ['Admin'], targetPath: '/catalogue' });
    await page.getByText('Nhân viên', { exact: true }).click();
    await page.getByRole('button', { name: 'Hiện' }).first().click();

    await page.getByRole('button', { name: 'Tạo mới nhân viên' }).click();

    await expect(page.getByText('Vui lòng nhập tên nhân viên')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mã nhân viên')).toBeVisible();
    await expect(page.getByText('Vui lòng chọn chức vụ')).toBeVisible();
  });
});

test.describe('Danh mục — các tab còn lại', () => {
  test('chuyển sang tab Hàng hóa và Vị trí lưu trữ không lỗi', async ({ page }) => {
    await mockCatalogueBase(page);
    await loginAs(page, { roles: ['Admin'], targetPath: '/catalogue' });

    await expect(page.getByText('Danh sách sản phẩm')).toBeVisible();

    await page.getByText('Vị trí lưu trữ', { exact: true }).click();
    await expect(page.getByText('Danh sách vị trí lưu trữ')).toBeVisible();
  });
});
