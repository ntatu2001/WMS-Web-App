import { describe, it, expect, vi, beforeEach } from 'vitest';

// Giả lập jsPDF/autoTable — xem giải thích chi tiết trong exportReceiptPdf.test.js
// (file test song song bên GoodReceipt).
const saveMock = vi.fn();
const addImageMock = vi.fn();

function FakeJsPDF() {
  this.lastAutoTable = { finalY: 100 };
}
FakeJsPDF.prototype.setFont = function () { return this; };
FakeJsPDF.prototype.setFontSize = function () { return this; };
FakeJsPDF.prototype.text = function () { return this; };
FakeJsPDF.prototype.addImage = addImageMock;
FakeJsPDF.prototype.addPage = function () {};
FakeJsPDF.prototype.save = saveMock;
FakeJsPDF.API = { events: [] };

const autoTableMock = vi.fn((doc) => {
  doc.lastAutoTable = { finalY: 100 };
});

vi.mock('jspdf', () => ({ jsPDF: FakeJsPDF }));
vi.mock('jspdf-autotable', () => ({ autoTable: autoTableMock }));
vi.mock('../../../common/pdf/fonts/Roboto-normal.js', () => ({}));
vi.mock('../../../common/pdf/fonts/Roboto-bold.js', () => ({}));

import { exportStockTakeToPdf } from './exportStockTakePdf';

beforeEach(() => {
  saveMock.mockClear();
  addImageMock.mockClear();
  autoTableMock.mockClear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
});

describe('exportStockTakeToPdf', () => {
  const selectedItem = {
    lotNumber: 'STK001',
    warehouseName: 'Kho C',
    warehouseID: 'WH-C',
    personName: 'Đỗ Văn G',
  };

  const lineItems = [
    { id: '1.1', materialName: 'Cao su tồn kho', materialId: 'SP003', unitOfMeasure: 'Kg', previousQuantity: 100, realAdjustmentQuantity: 90, quantityDifference: -10 },
  ];

  const formValues = {
    preparerName: 'Vũ Thị H',
    documentDate: '2026-09-13',
    unitPrices: { '1.1': 15000 },
    committeeMembers: [{ name: 'Vũ Thị H', role: 'Trưởng ban' }, { name: '', role: '' }],
    proposal: 'Đề nghị điều chỉnh giảm theo thực tế kiểm kê',
  };

  it('tính đúng thành tiền sổ sách/kiểm kê/chênh lệch và xuất khổ ngang', async () => {
    await exportStockTakeToPdf(selectedItem, lineItems, formValues);

    const tableConfig = autoTableMock.mock.calls[0][1];
    expect(tableConfig.body).toEqual([
      [1, 'Cao su tồn kho', 'SP003', 'Kg', '15.000', 100, '1.500.000', 90, '1.350.000', -10, '-150.000'],
    ]);
    expect(tableConfig.foot[0]).toEqual([
      { content: 'Cộng', colSpan: 5, styles: { halign: 'right' } },
      100,
      '1.500.000',
      90,
      '1.350.000',
      -10,
      '-150.000',
    ]);

    expect(saveMock).toHaveBeenCalledWith('Bien_ban_kiem_ke_STK001.pdf');
  });
});
