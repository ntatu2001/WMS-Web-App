import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import CreateGoodReceipt from './CreateGoodReceipt';
import { createTestStore } from '../../../../test/test-utils';

vi.mock('../../../../api/wareHouseApi.js', () => ({ default: { getAllWarehouseNameId: vi.fn() } }));
vi.mock('../../../../api/supplierApi.js', () => ({ default: { getAllSupplierNameId: vi.fn() } }));
vi.mock('../../../../api/employeeApi.js', () => ({ default: { getAllEmployeeNameId: vi.fn() } }));
vi.mock('../../../../api/receiptLotApi.js', () => ({ default: { getAllReceiptLotIds: vi.fn() } }));
vi.mock('../../../../api/materialApi.js', () => ({
  default: { getMaterialsByWarehouseId: vi.fn(), getUnitByMaterialId: vi.fn() },
}));
vi.mock('../../../../api/inventoryReceiptApi.js', () => ({ default: { createReceipt: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// Giữ nguyên parseDmY thật (hàm thuần, đã unit test riêng), chỉ mock parseReceiptExcel
// để kiểm soát kết quả parse theo từng kịch bản mà không phải build file .xlsx thật.
vi.mock('../../utils/parseReceiptExcel.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, parseReceiptExcel: vi.fn() };
});

import wareHouseApi from '../../../../api/wareHouseApi.js';
import supplierApi from '../../../../api/supplierApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import receiptLotApi from '../../../../api/receiptLotApi.js';
import materialApi from '../../../../api/materialApi.js';
import inventoryReceiptApi from '../../../../api/inventoryReceiptApi.js';
import { toast } from 'react-toastify';
import { parseReceiptExcel } from '../../utils/parseReceiptExcel.js';

const WAREHOUSE = { warehouseName: 'Kho A', warehouseId: 'KHO001' };
const SUPPLIER = { supplierName: 'NCC A', supplierId: 'SUP001' };
const EMPLOYEE = { employeeName: 'NV A', employeeId: 'EMP001' };
const MATERIAL = { materialName: 'Sản phẩm A', materialId: 'SP001' };

beforeEach(() => {
  wareHouseApi.getAllWarehouseNameId.mockReset().mockResolvedValue([WAREHOUSE]);
  supplierApi.getAllSupplierNameId.mockReset().mockResolvedValue([SUPPLIER]);
  employeeApi.getAllEmployeeNameId.mockReset().mockResolvedValue([EMPLOYEE]);
  receiptLotApi.getAllReceiptLotIds.mockReset().mockResolvedValue([]);
  materialApi.getMaterialsByWarehouseId.mockReset().mockResolvedValue([MATERIAL]);
  materialApi.getUnitByMaterialId.mockReset().mockResolvedValue('Cái');
  inventoryReceiptApi.createReceipt.mockReset();
  parseReceiptExcel.mockReset();
  toast.error.mockReset();
  toast.success.mockReset();
});

async function renderForm() {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <CreateGoodReceipt />
    </Provider>
  );
  // Chờ qua màn loading ban đầu (4 API danh mục fetch song song lúc mount).
  await waitFor(() => expect(screen.getByRole('button', { name: 'Tạo phiếu nhập kho' })).toBeInTheDocument());
}

// Dùng fireEvent thay vì userEvent.upload: input có accept=".xlsx,.xls" nên
// userEvent.upload sẽ tự lọc bỏ file không khớp accept (kể cả khi test muốn cố
// tình upload sai đuôi file để kiểm tra nhánh validate riêng của component).
function importFile(file) {
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });
}

const dummyFile = new File(['dummy'], 'test.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

describe('CreateGoodReceipt', () => {
  it('submit khi chưa chọn gì -> báo đủ lỗi validate, không gọi API tạo phiếu', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu nhập kho' }));

    expect(screen.getByText('Vui lòng chọn kho hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn mã kho hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn nhà cung cấp')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn nhân viên')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn ngày nhập kho')).toBeInTheDocument();
    expect(screen.getByText('Chọn sản phẩm')).toBeInTheDocument(); // lỗi ở dòng sản phẩm mặc định
    expect(screen.getByText('SL > 0')).toBeInTheDocument();
    expect(inventoryReceiptApi.createReceipt).not.toHaveBeenCalled();
  });

  it('import Excel không đúng đuôi file -> báo lỗi, không gọi parseReceiptExcel', async () => {
    await renderForm();
    const badFile = new File(['x'], 'data.pdf', { type: 'application/pdf' });

    await importFile(badFile);

    expect(await screen.findByText('Vui lòng dùng file .xlsx theo mẫu.')).toBeInTheDocument();
    expect(parseReceiptExcel).not.toHaveBeenCalled();
  });

  it('import Excel có lỗi cấu trúc -> hiển thị banner đỏ liệt kê lỗi, không đổi state form', async () => {
    parseReceiptExcel.mockResolvedValue({ errors: ['Thiếu cột Mã lô', 'Sai tên sheet'] });
    await renderForm();

    await importFile(dummyFile);

    expect(await screen.findByText('Thiếu cột Mã lô')).toBeInTheDocument();
    expect(screen.getByText('Sai tên sheet')).toBeInTheDocument();
    // Vẫn còn đúng 1 dòng trống mặc định, chưa bị import ghi đè.
    expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('import Excel hợp lệ -> điền form, hiện banner xanh, submit gửi đúng payload lên API', async () => {
    parseReceiptExcel.mockResolvedValue({
      header: {
        warehouseName: 'Kho A',
        warehouseCode: 'KHO001',
        supplierName: 'NCC A',
        employeeName: 'NV A',
        dateText: '01/01/2024',
      },
      items: [
        { rowNumber: 9, productName: 'Sản phẩm A', productCode: '', unit: 'Cái', lotNumber: 'LOT001', quantity: '10', note: '' },
      ],
    });
    inventoryReceiptApi.createReceipt.mockResolvedValue({});
    const user = userEvent.setup();
    await renderForm();

    await importFile(dummyFile);

    expect(await screen.findByText(/Đã nhập phiếu và 1 dòng sản phẩm/)).toBeInTheDocument();
    expect(screen.getByText('Kho A')).toBeInTheDocument();
    expect(screen.getByText('NCC A')).toBeInTheDocument();
    expect(screen.getByText('NV A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu nhập kho' }));

    await waitFor(() => expect(inventoryReceiptApi.createReceipt).toHaveBeenCalledTimes(1));
    const payload = inventoryReceiptApi.createReceipt.mock.calls[0][0];
    expect(payload).toMatchObject({
      warehouseId: 'KHO001',
      supplierId: 'SUP001',
      employeeId: 'EMP001',
      entries: [
        { materialName: 'Sản phẩm A', materialId: 'SP001', unit: 'Cái', lotNumber: 'LOT001', importedQuantity: '10' },
      ],
    });
    expect(payload.receiptDate.getTime()).toBe(new Date(2024, 0, 1).getTime());
    expect(toast.success).toHaveBeenCalledWith('Tạo phiếu nhập kho thành công!', expect.anything());
  });

  it('submit thất bại từ API -> hiện toast lỗi, không reset form', async () => {
    parseReceiptExcel.mockResolvedValue({
      header: {
        warehouseName: 'Kho A',
        warehouseCode: 'KHO001',
        supplierName: 'NCC A',
        employeeName: 'NV A',
        dateText: '01/01/2024',
      },
      items: [
        { rowNumber: 9, productName: 'Sản phẩm A', productCode: '', unit: 'Cái', lotNumber: 'LOT001', quantity: '10', note: '' },
      ],
    });
    inventoryReceiptApi.createReceipt.mockRejectedValue({ response: { data: { message: 'Kho đã đóng phiếu trong ngày' } } });
    const user = userEvent.setup();
    await renderForm();
    await importFile(dummyFile);
    await screen.findByText(/Đã nhập phiếu và 1 dòng sản phẩm/);

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu nhập kho' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Kho đã đóng phiếu trong ngày', expect.anything()));
    expect(screen.getByText('Kho A')).toBeInTheDocument(); // form không bị reset khi lỗi
  });

  it('lô hàng trùng mã đã tồn tại trong kho -> báo lỗi ở dòng tương ứng và không submit được', async () => {
    receiptLotApi.getAllReceiptLotIds.mockResolvedValue(['LOT001']);
    parseReceiptExcel.mockResolvedValue({
      header: {
        warehouseName: 'Kho A',
        warehouseCode: 'KHO001',
        supplierName: 'NCC A',
        employeeName: 'NV A',
        dateText: '01/01/2024',
      },
      items: [
        { rowNumber: 9, productName: 'Sản phẩm A', productCode: '', unit: 'Cái', lotNumber: 'LOT001', quantity: '10', note: '' },
      ],
    });

    await renderForm();
    await importFile(dummyFile);

    expect(await screen.findByText('Dòng 9: mã lô "LOT001" đã tồn tại trong hệ thống.')).toBeInTheDocument();
    expect(inventoryReceiptApi.createReceipt).not.toHaveBeenCalled();
  });
});
