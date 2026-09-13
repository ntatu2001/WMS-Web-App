import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import CreateGoodIssue from './CreateGoodIssue';
import { createTestStore } from '../../../../test/test-utils';

vi.mock('../../../../api/wareHouseApi.js', () => ({ default: { getAllWarehouseNameId: vi.fn() } }));
vi.mock('../../../../api/customerApi.js', () => ({ default: { getAllCustomerNameId: vi.fn() } }));
vi.mock('../../../../api/employeeApi.js', () => ({ default: { getAllEmployeeNameId: vi.fn() } }));
vi.mock('../../../../api/materialApi.js', () => ({
  default: { getMaterialsByWarehouseIdAndMaterialLot: vi.fn(), getUnitByMaterialId: vi.fn() },
}));
vi.mock('../../../../api/materiaLotApi.js', () => ({
  default: { GetLotNumbersByMaterialId: vi.fn(), GetQuantityByMaterialLotId: vi.fn() },
}));
vi.mock('../../../../api/inventoryIssueApi.js', () => ({ default: { createIssue: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

vi.mock('../../utils/parseIssueExcel.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, parseIssueExcel: vi.fn() };
});

import wareHouseApi from '../../../../api/wareHouseApi.js';
import customerApi from '../../../../api/customerApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import materialApi from '../../../../api/materialApi.js';
import materiaLotApi from '../../../../api/materiaLotApi.js';
import inventoryIssueApi from '../../../../api/inventoryIssueApi.js';
import { toast } from 'react-toastify';
import { parseIssueExcel } from '../../utils/parseIssueExcel.js';

const WAREHOUSE = { warehouseName: 'Kho A', warehouseId: 'KHO001' };
const CUSTOMER = { customerName: 'KH A', customerId: 'CUS001' };
const EMPLOYEE = { employeeName: 'NV A', employeeId: 'EMP001' };
const MATERIAL = { materialName: 'Sản phẩm A', materialId: 'SP001' };

beforeEach(() => {
  wareHouseApi.getAllWarehouseNameId.mockReset().mockResolvedValue([WAREHOUSE]);
  customerApi.getAllCustomerNameId.mockReset().mockResolvedValue([CUSTOMER]);
  employeeApi.getAllEmployeeNameId.mockReset().mockResolvedValue([EMPLOYEE]);
  materialApi.getMaterialsByWarehouseIdAndMaterialLot.mockReset().mockResolvedValue([MATERIAL]);
  materialApi.getUnitByMaterialId.mockReset().mockResolvedValue('Cái');
  materiaLotApi.GetLotNumbersByMaterialId.mockReset().mockResolvedValue(['LOT001']);
  materiaLotApi.GetQuantityByMaterialLotId.mockReset().mockResolvedValue({ availableQuantity: 100 });
  inventoryIssueApi.createIssue.mockReset();
  parseIssueExcel.mockReset();
  toast.error.mockReset();
  toast.success.mockReset();
});

async function renderForm() {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <CreateGoodIssue />
    </Provider>
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Tạo phiếu xuất kho' })).toBeInTheDocument());
}

function importFile(file) {
  const input = document.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [file] } });
}

const dummyFile = new File(['dummy'], 'test.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

const validHeader = {
  warehouseName: 'Kho A',
  warehouseCode: 'KHO001',
  customerName: 'KH A',
  employeeName: 'NV A',
  dateText: '01/01/2024',
};

describe('CreateGoodIssue', () => {
  it('submit khi chưa chọn gì -> báo đủ lỗi validate, không gọi API tạo phiếu', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu xuất kho' }));

    expect(screen.getByText('Vui lòng chọn kho hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn mã kho hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn nhân viên')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn ngày xuất kho')).toBeInTheDocument();
    expect(screen.getByText('Chọn sản phẩm')).toBeInTheDocument();
    expect(screen.getByText('Chọn mã lô/số PO')).toBeInTheDocument();
    expect(screen.getByText('SL > 0')).toBeInTheDocument();
    expect(inventoryIssueApi.createIssue).not.toHaveBeenCalled();
  });

  it('import Excel không đúng đuôi file -> báo lỗi, không gọi parseIssueExcel', async () => {
    await renderForm();
    const badFile = new File(['x'], 'data.pdf', { type: 'application/pdf' });

    importFile(badFile);

    expect(await screen.findByText('Vui lòng dùng file .xlsx theo mẫu.')).toBeInTheDocument();
    expect(parseIssueExcel).not.toHaveBeenCalled();
  });

  it('import Excel có lỗi cấu trúc -> hiển thị banner đỏ, không đổi state form', async () => {
    parseIssueExcel.mockResolvedValue({ errors: ['Thiếu cột Mã lô', 'Sai tên sheet'] });
    await renderForm();

    importFile(dummyFile);

    expect(await screen.findByText('Thiếu cột Mã lô')).toBeInTheDocument();
    expect(screen.getByText('Sai tên sheet')).toBeInTheDocument();
    expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('import Excel có dòng vượt quá tồn kho -> báo lỗi cụ thể theo dòng, không điền form', async () => {
    materiaLotApi.GetQuantityByMaterialLotId.mockResolvedValue({ availableQuantity: 5 });
    parseIssueExcel.mockResolvedValue({
      header: validHeader,
      items: [{ rowNumber: 9, productName: 'Sản phẩm A', productCode: '', unit: 'Cái', lotNumber: 'LOT001', quantity: '10', note: '' }],
    });
    await renderForm();

    importFile(dummyFile);

    expect(await screen.findByText('Dòng 9: SL xuất vượt quá tồn kho (5).')).toBeInTheDocument();
    expect(inventoryIssueApi.createIssue).not.toHaveBeenCalled();
  });

  it('import Excel hợp lệ -> điền form, hiện banner xanh, submit gửi đúng payload lên API', async () => {
    parseIssueExcel.mockResolvedValue({
      header: validHeader,
      items: [{ rowNumber: 9, productName: 'Sản phẩm A', productCode: '', unit: 'Cái', lotNumber: 'LOT001', quantity: '10', note: '' }],
    });
    inventoryIssueApi.createIssue.mockResolvedValue({});
    const user = userEvent.setup();
    await renderForm();

    importFile(dummyFile);

    expect(await screen.findByText(/Đã nhập phiếu và 1 dòng sản phẩm/)).toBeInTheDocument();
    expect(screen.getByText('Kho A')).toBeInTheDocument();
    expect(screen.getByText('KH A')).toBeInTheDocument();
    expect(screen.getByText('NV A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu xuất kho' }));

    await waitFor(() => expect(inventoryIssueApi.createIssue).toHaveBeenCalledTimes(1));
    const payload = inventoryIssueApi.createIssue.mock.calls[0][0];
    expect(payload).toMatchObject({
      warehouseId: 'KHO001',
      customerId: 'CUS001',
      employeeId: 'EMP001',
      entries: [
        { materialName: 'Sản phẩm A', materialId: 'SP001', unit: 'Cái', purchaseOrderNumber: 'LOT001', requestedQuantity: '10' },
      ],
    });
    expect(payload.issueDate.getTime()).toBe(new Date(2024, 0, 1).getTime());
    expect(toast.success).toHaveBeenCalledWith('Tạo phiếu xuất kho thành công!', expect.anything());
  });

  it('submit thất bại từ API -> hiện toast lỗi, không reset form', async () => {
    parseIssueExcel.mockResolvedValue({
      header: validHeader,
      items: [{ rowNumber: 9, productName: 'Sản phẩm A', productCode: '', unit: 'Cái', lotNumber: 'LOT001', quantity: '10', note: '' }],
    });
    inventoryIssueApi.createIssue.mockRejectedValue({ response: { data: { message: 'Tồn kho không đủ để xuất' } } });
    const user = userEvent.setup();
    await renderForm();
    importFile(dummyFile);
    await screen.findByText(/Đã nhập phiếu và 1 dòng sản phẩm/);

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu xuất kho' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Tồn kho không đủ để xuất', expect.anything()));
    expect(screen.getByText('Kho A')).toBeInTheDocument();
  });
});
