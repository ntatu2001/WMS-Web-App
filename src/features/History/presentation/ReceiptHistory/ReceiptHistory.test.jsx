import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReceiptHistory from './ReceiptHistory';
import { renderWithProviders } from '../../../../test/test-utils';

vi.mock('../../../../api/ReceiptApi.js', () => ({ default: { getAllReceipt: vi.fn() } }));
vi.mock('../../../../api/supplierApi.js', () => ({ default: { getAllSupplierNameId: vi.fn() } }));
vi.mock('../../../GoodReceipt/utils/exportReceiptPdf.js', () => ({ exportReceiptToPdf: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import ReceiptApi from '../../../../api/ReceiptApi.js';
import supplierApi from '../../../../api/supplierApi.js';
import { exportReceiptToPdf } from '../../../GoodReceipt/utils/exportReceiptPdf.js';
import { toast } from 'react-toastify';

const HISTORY_ITEM = {
  lotNumber: 'LOT001',
  receiptDate: '2026-09-01',
  personName: 'Nguyễn Văn A',
  supplierName: 'NCC Trường Nguyên',
  warehouseName: 'Kho A',
  warehouseID: 'WH-A',
  lotStatus: 'Hoàn thành',
};

const DETAIL_ENTRIES = [
  {
    materialName: 'Cao su thô',
    materialId: 'SP001',
    unitOfMeasure: 'Kg',
    warehouseID: 'WH-A',
    lotNumber: 'LOT001',
    receiptSubLots: [{ importedQuantity: 100, locationId: 'A1-01' }],
  },
];

beforeEach(() => {
  ReceiptApi.getAllReceipt.mockReset();
  supplierApi.getAllSupplierNameId.mockReset().mockResolvedValue([]);
  exportReceiptToPdf.mockReset().mockResolvedValue(undefined);
  toast.success.mockReset();
  toast.error.mockReset();
});

// Chọn 1 lô: gõ mã lô -> Tìm kiếm (trả về danh sách) -> click vào lô trong danh sách
// (trả về chi tiết) -> chờ bảng chi tiết render xong.
async function selectLot(user) {
  ReceiptApi.getAllReceipt.mockResolvedValueOnce([HISTORY_ITEM]).mockResolvedValueOnce(DETAIL_ENTRIES);

  await user.type(screen.getByPlaceholderText('Tìm kiếm theo Mã lô/ số PO'), 'LOT001');
  await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }));
  await waitFor(() => expect(screen.getByText('LOT001')).toBeInTheDocument());

  await user.click(screen.getByText('LOT001'));
  await waitFor(() => expect(screen.getByText('Cao su thô')).toBeInTheDocument());
}

describe('ReceiptHistory - Xuất PDF', () => {
  it('mở modal, nhập đơn giá và gọi exportReceiptToPdf với đúng dữ liệu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptHistory />);

    await selectLot(user);

    const exportButton = screen.getByRole('button', { name: /Xuất PDF/i });
    expect(exportButton).toBeEnabled();
    await user.click(exportButton);

    expect(screen.getByText('Bổ sung thông tin trước khi xuất Phiếu nhập kho (PDF)')).toBeInTheDocument();

    const priceInput = screen.getByRole('spinbutton');
    await user.type(priceInput, '20000');

    // Có 2 nút trùng tên "Xuất PDF" (nút mở modal ở nền + nút xác nhận trong modal) -> lấy nút cuối (trong modal).
    const confirmButtons = screen.getAllByRole('button', { name: 'Xuất PDF' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(exportReceiptToPdf).toHaveBeenCalledTimes(1));
    const [selectedItemArg, lineItemsArg, formValuesArg] = exportReceiptToPdf.mock.calls[0];
    expect(selectedItemArg.lotNumber).toBe('LOT001');
    expect(lineItemsArg).toEqual([
      { id: '1.1', materialName: 'Cao su thô', materialId: 'SP001', unitOfMeasure: 'Kg', quantity: 100 },
    ]);
    expect(Number(formValuesArg.unitPrices['1.1'])).toBe(20000);

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(screen.queryByText('Bổ sung thông tin trước khi xuất Phiếu nhập kho (PDF)')).not.toBeInTheDocument();
  });

  it('không cho xuất khi chưa nhập đơn giá cho dòng nào', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReceiptHistory />);

    await selectLot(user);
    await user.click(screen.getByRole('button', { name: /Xuất PDF/i }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Xuất PDF' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByText('Vui lòng nhập đơn giá cho tất cả các dòng.')).toBeInTheDocument();
    expect(exportReceiptToPdf).not.toHaveBeenCalled();
  });
});
