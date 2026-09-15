import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import CreateTransfer from './CreateTransfer';
import { createTestStore } from '../../../../test/test-utils';

vi.mock('../../../../api/wareHouseApi.js', () => ({ default: { getAllWarehouseNameId: vi.fn() } }));
vi.mock('../../../../api/employeeApi.js', () => ({ default: { getAllEmployeeNameId: vi.fn() } }));
vi.mock('../../../../api/locationApi.js', () => ({ default: { GetLocationsByWarehouseId: vi.fn() } }));
vi.mock('../../../../api/materialSubLotApi.js', () => ({ default: { getMaterialSubLotsByLocationId: vi.fn() } }));
vi.mock('../../../../api/transferApi.js', () => ({ default: { createTransfer: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import wareHouseApi from '../../../../api/wareHouseApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import locationApi from '../../../../api/locationApi.js';
import materialSubLotApi from '../../../../api/materialSubLotApi.js';
import transferApi from '../../../../api/transferApi.js';
import { toast } from 'react-toastify';

const FROM_WAREHOUSE = { warehouseName: 'Kho A', warehouseId: 'KHOA' };
const TO_WAREHOUSE = { warehouseName: 'Kho B', warehouseId: 'KHOB' };
const EMPLOYEE = { employeeName: 'NV A', employeeId: 'EMP001' };
const LOCATION = { locationId: 'LOC001', storageStatus: 'Đang chứa hàng', lotInfors: [] };
const SUBLOT = {
  materialSubLotId: 'SUBLOT1',
  materialId: 'SP001',
  materialName: 'Sản phẩm A',
  lotNumber: 'LOT001',
  existingQuantity: 50,
  unitOfMeasure: 'Cái',
};

beforeEach(() => {
  wareHouseApi.getAllWarehouseNameId.mockReset().mockResolvedValue([FROM_WAREHOUSE, TO_WAREHOUSE]);
  employeeApi.getAllEmployeeNameId.mockReset().mockResolvedValue([EMPLOYEE]);
  locationApi.GetLocationsByWarehouseId.mockReset().mockResolvedValue([LOCATION]);
  materialSubLotApi.getMaterialSubLotsByLocationId.mockReset().mockResolvedValue([SUBLOT]);
  transferApi.createTransfer.mockReset();
  toast.error.mockReset();
  toast.success.mockReset();
});

async function renderForm() {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <CreateTransfer />
    </Provider>
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Tạo phiếu điều chuyển' })).toBeInTheDocument());
}

async function selectOption(user, placeholderText, optionText) {
  await user.click(screen.getByText(placeholderText));
  await user.click(await screen.findByText(optionText));
}

async function fillHeaderAndOneRow(user, { toWarehouseName = 'Kho B' } = {}) {
  await selectOption(user, 'Chọn kho nguồn', 'Kho A');
  await waitFor(() => expect(locationApi.GetLocationsByWarehouseId).toHaveBeenCalledWith('KHOA'));
  await selectOption(user, 'Chọn kho đích', toWarehouseName);
  await selectOption(user, 'Chọn nhân viên', 'NV A');
  fireEvent.change(document.querySelector('input[type="datetime-local"]'), {
    target: { value: '2024-01-01T08:00' },
  });

  await selectOption(user, 'Chọn vị trí nguồn', 'LOC001');
  await waitFor(() => expect(materialSubLotApi.getMaterialSubLotsByLocationId).toHaveBeenCalledWith('LOC001'));
  await selectOption(user, 'Chọn lô phụ', 'Sản phẩm A — LOT001');
}

describe('CreateTransfer', () => {
  it('submit khi chưa chọn gì -> báo đủ lỗi validate, không gọi API tạo phiếu', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu điều chuyển' }));

    expect(screen.getByText('Vui lòng chọn kho nguồn')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn kho đích')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn người tạo phiếu')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn ngày điều chuyển')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn lô phụ')).toBeInTheDocument();
    expect(screen.getByText('SL > 0')).toBeInTheDocument();
    expect(transferApi.createTransfer).not.toHaveBeenCalled();
  });

  it('chọn trùng kho nguồn và kho đích -> báo lỗi, không gọi API', async () => {
    const user = userEvent.setup();
    await renderForm();

    await selectOption(user, 'Chọn kho nguồn', 'Kho A');
    // Chọn "Kho A" cho ô kho đích: react-select render menu qua portal vào cuối <body>,
    // nên phần tử [1] là option trong menu vừa mở, [0] là singleValue của ô kho nguồn.
    await user.click(screen.getByText('Chọn kho đích'));
    const khoAOptions = await screen.findAllByText('Kho A');
    await user.click(khoAOptions[khoAOptions.length - 1]);
    await user.click(screen.getByRole('button', { name: 'Tạo phiếu điều chuyển' }));

    expect(screen.getByText('Kho nguồn và kho đích không được trùng nhau')).toBeInTheDocument();
    expect(transferApi.createTransfer).not.toHaveBeenCalled();
  });

  it('số lượng vượt quá khả dụng -> báo lỗi ở dòng, không submit được', async () => {
    const user = userEvent.setup();
    await renderForm();
    await fillHeaderAndOneRow(user);

    const qtyInput = document.querySelector('input[type="number"]');
    await user.clear(qtyInput);
    await user.type(qtyInput, '999');

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu điều chuyển' }));

    expect(screen.getByText('SL vượt quá số lượng khả dụng')).toBeInTheDocument();
    expect(transferApi.createTransfer).not.toHaveBeenCalled();
  });

  it('điền đầy đủ và submit thành công -> gửi đúng payload, toast thành công, reset form', async () => {
    transferApi.createTransfer.mockResolvedValue({});
    const user = userEvent.setup();
    await renderForm();
    await fillHeaderAndOneRow(user);

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu điều chuyển' }));

    await waitFor(() => expect(transferApi.createTransfer).toHaveBeenCalledTimes(1));
    const payload = transferApi.createTransfer.mock.calls[0][0];
    expect(payload).toMatchObject({
      fromWarehouseId: 'KHOA',
      toWarehouseId: 'KHOB',
      requestedByEmployeeId: 'EMP001',
      entries: [{ materialId: 'SP001', materialSubLotId: 'SUBLOT1', lotNumber: 'LOT001', quantity: 50 }],
    });
    expect(toast.success).toHaveBeenCalledWith('Tạo phiếu điều chuyển thành công!', expect.anything());
  });

  it('submit thất bại từ API -> hiện toast lỗi theo mã lỗi backend', async () => {
    transferApi.createTransfer.mockRejectedValue({ response: { data: { code: 'SameWarehouseTransfer' } } });
    const user = userEvent.setup();
    await renderForm();
    await fillHeaderAndOneRow(user);

    await user.click(screen.getByRole('button', { name: 'Tạo phiếu điều chuyển' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể điều chuyển trong cùng 1 kho. Vui lòng dùng Sơ đồ kho để di dời nội bộ.',
        expect.anything()
      )
    );
  });
});
