import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import LotAdjustmentRequest from './LotAdjustmentRequest';
import { createTestStore } from '../../../../test/test-utils';

vi.mock('../../../../api/wareHouseApi.js', () => ({ default: { getAllWarehouseNameId: vi.fn() } }));
vi.mock('../../../../api/employeeApi.js', () => ({ default: { getAllEmployeeNameId: vi.fn() } }));
vi.mock('../../../../api/materialApi.js', () => ({
  default: { getMaterialById: vi.fn(), getUnitByMaterialId: vi.fn() },
}));
vi.mock('../../../../api/materiaLotApi.js', () => ({
  default: { GetLotNumbersByWarehouseId: vi.fn(), getMaterialIdByLotNumber: vi.fn() },
}));
vi.mock('../../../../api/materialSubLotApi.js', () => ({
  default: { getMaterialSubLotsByLotNumber: vi.fn() },
}));
vi.mock('../../../../api/lotAdjustmentApi.js', () => ({
  default: { createNewStockTake: vi.fn(), updateStockTake: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

import wareHouseApi from '../../../../api/wareHouseApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import materialApi from '../../../../api/materialApi.js';
import materiaLotApi from '../../../../api/materiaLotApi.js';
import materialSubLotApi from '../../../../api/materialSubLotApi.js';
import lotAdjustmentApi from '../../../../api/lotAdjustmentApi.js';
import { toast } from 'react-toastify';

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

beforeEach(() => {
  wareHouseApi.getAllWarehouseNameId.mockReset().mockResolvedValue([WAREHOUSE]);
  employeeApi.getAllEmployeeNameId.mockReset().mockResolvedValue([EMPLOYEE]);
  materiaLotApi.GetLotNumbersByWarehouseId.mockReset().mockResolvedValue(['LOT001']);
  materiaLotApi.getMaterialIdByLotNumber.mockReset().mockResolvedValue('SP001');
  materialSubLotApi.getMaterialSubLotsByLotNumber.mockReset().mockResolvedValue([SUBLOT]);
  materialApi.getMaterialById.mockReset().mockResolvedValue(MATERIAL);
  materialApi.getUnitByMaterialId.mockReset().mockResolvedValue('Cái');
  lotAdjustmentApi.createNewStockTake.mockReset();
  lotAdjustmentApi.updateStockTake.mockReset();
  toast.error.mockReset();
  toast.success.mockReset();
  toast.info.mockReset();
});

async function renderForm() {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <LotAdjustmentRequest />
    </Provider>
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Tạo yêu cầu' })).toBeInTheDocument());
}

async function selectOption(user, placeholderText, optionText) {
  await user.click(screen.getByText(placeholderText));
  await user.click(await screen.findByText(optionText));
}

// Chọn đủ kho -> mã kho tự chọn theo effect -> chờ danh sách lô tải xong -> chọn lô
// (trigger fetch chi tiết sản phẩm/sublot) -> loại kiểm kê -> lý do -> nhân viên -> ngày.
async function fillAndSelectLot(user) {
  await selectOption(user, 'Chọn loại kho hàng', 'Kho A');
  await waitFor(() => expect(materiaLotApi.GetLotNumbersByWarehouseId).toHaveBeenCalledWith('KHO001'));
  await selectOption(user, 'Chọn lô hàng kiểm kê', 'LOT001');
  await waitFor(() => expect(materialSubLotApi.getMaterialSubLotsByLotNumber).toHaveBeenCalledWith('LOT001'));
  await screen.findByText('Sản phẩm A');
}

async function fillFullFormAndSelectLot(user) {
  await fillAndSelectLot(user);
  await selectOption(user, 'Chọn loại kiểm kê', 'Kiểm kê định kỳ');
  await selectOption(user, 'Chọn lý do kiểm kê', 'Hư hỏng');
  await selectOption(user, 'Chọn nhân viên', 'NV A');
  fireEvent.change(document.querySelector('input[type="datetime-local"]'), {
    target: { value: '2024-01-01T08:00' },
  });
}

describe('LotAdjustmentRequest', () => {
  it('submit khi chưa chọn gì -> báo đủ lỗi validate, không gọi API tạo yêu cầu', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(screen.getByRole('button', { name: 'Tạo yêu cầu' }));

    expect(screen.getByText('Vui lòng chọn kho hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn mã kho hàng')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn lô kiểm kê')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn loại kiểm kê')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn lý do')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn nhân viên')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn ngày thực hiện')).toBeInTheDocument();
    expect(lotAdjustmentApi.createNewStockTake).not.toHaveBeenCalled();
  });

  it('chọn lô kiểm kê -> nạp đúng thông tin sản phẩm và danh sách vị trí', async () => {
    const user = userEvent.setup();
    await renderForm();

    await fillAndSelectLot(user);

    expect(screen.getByText('Cái')).toBeInTheDocument(); // đơn vị tính
    expect(screen.getByText('LOC001')).toBeInTheDocument(); // vị trí lưu trữ
    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // tồn kho hiện tại của sublot
  });

  it('điền đầy đủ và tạo yêu cầu thành công -> gọi đúng payload, cho phép duyệt sau đó', async () => {
    lotAdjustmentApi.createNewStockTake.mockResolvedValue('ADJ001');
    const user = userEvent.setup();
    await renderForm();
    await fillFullFormAndSelectLot(user);

    await user.click(screen.getByRole('button', { name: 'Tạo yêu cầu' }));

    await waitFor(() => expect(lotAdjustmentApi.createNewStockTake).toHaveBeenCalledTimes(1));
    expect(lotAdjustmentApi.createNewStockTake).toHaveBeenCalledWith({
      warehouseId: 'KHO001',
      employeeId: 'EMP001',
      adjustmentDate: new Date('2024-01-01T08:00'),
      lotNumber: 'LOT001',
      reason: 'Damaged',
      adjustmentType: 'Periodic',
      note: '--',
    });
    expect(toast.success).toHaveBeenCalledWith('Tạo yêu cầu kiểm kê thành công!', expect.anything());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Duyệt kiểm kê' })).toBeEnabled());
  });

  it('duyệt khi chưa sửa số lượng thực tế nào -> báo không có thay đổi, không gọi API cập nhật', async () => {
    lotAdjustmentApi.createNewStockTake.mockResolvedValue('ADJ001');
    const user = userEvent.setup();
    await renderForm();
    await fillFullFormAndSelectLot(user);
    await user.click(screen.getByRole('button', { name: 'Tạo yêu cầu' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Duyệt kiểm kê' })).toBeEnabled());

    await user.click(screen.getByRole('button', { name: 'Duyệt kiểm kê' }));

    expect(toast.info).toHaveBeenCalledWith('Không có thay đổi nào để duyệt kiểm kê', expect.anything());
    expect(lotAdjustmentApi.updateStockTake).not.toHaveBeenCalled();
  });

  it('sửa số lượng thực tế rồi duyệt -> gọi updateStockTake đúng payload và reset form', async () => {
    lotAdjustmentApi.createNewStockTake.mockResolvedValue('ADJ001');
    lotAdjustmentApi.updateStockTake.mockResolvedValue({});
    const user = userEvent.setup();
    await renderForm();
    await fillFullFormAndSelectLot(user);
    await user.click(screen.getByRole('button', { name: 'Tạo yêu cầu' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Duyệt kiểm kê' })).toBeEnabled());

    const qtyInput = document.querySelector('tbody input[type="number"]');
    fireEvent.change(qtyInput, { target: { value: '15' } });

    await user.click(screen.getByRole('button', { name: 'Duyệt kiểm kê' }));

    await waitFor(() => expect(lotAdjustmentApi.updateStockTake).toHaveBeenCalledTimes(1));
    const payload = lotAdjustmentApi.updateStockTake.mock.calls[0][0];
    expect(payload).toMatchObject({
      lotNumber: 'LOT001',
      stockTakeId: 'ADJ001',
      materialSubLots: [
        { materialSubLotId: 'SUBLOT1', realQuantity: 15, subLotStatus: 'Active', unitOfMeasure: 'Cái' },
      ],
    });
    expect(toast.success).toHaveBeenCalledWith('Duyệt kiểm kê thành công!', expect.anything());
    // Form reset về trạng thái ban đầu.
    await waitFor(() => expect(screen.getByText('Không còn vị trí nào để kiểm kê.')).toBeInTheDocument());
  });

  it('xoá 1 vị trí kiểm kê: bấm huỷ thì giữ nguyên, xác nhận thì xoá khỏi danh sách', async () => {
    const user = userEvent.setup();
    await renderForm();
    await fillAndSelectLot(user);

    const rowDeleteButton = document.querySelector('tbody tr button');
    await user.click(rowDeleteButton);

    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByText('Xác nhận xóa')).not.toBeInTheDocument();
    expect(screen.getByText('LOC001')).toBeInTheDocument(); // vẫn còn dòng

    await user.click(rowDeleteButton);
    await user.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(screen.getByText('Không còn vị trí nào để kiểm kê.')).toBeInTheDocument();
  });
});
