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

import { exportIssueToPdf } from './exportIssuePdf';

beforeEach(() => {
  saveMock.mockClear();
  addImageMock.mockClear();
  autoTableMock.mockClear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
});

describe('exportIssueToPdf', () => {
  const selectedItem = {
    lotNumber: 'ISS001',
    warehouseName: 'Kho B',
    warehouseID: 'WH-B',
    customerName: 'Khách hàng X',
    personName: 'Phạm Văn D',
  };

  const lineItems = [
    { id: '1.1', materialName: 'Cao su thành phẩm', materialId: 'TP001', unitOfMeasure: 'Kg', quantity: 40 },
  ];

  const formValues = {
    debitAccount: '632',
    creditAccount: '156',
    preparerName: 'Ngô Thị E',
    documentDate: '2026-09-13',
    unitPrices: { '1.1': 50000 },
    totalAmount: 40 * 50000,
    receivedBy: 'Hoàng Văn F',
    reason: 'Xuất bán cho khách hàng X',
  };

  it('dựng đúng bảng dòng, dòng Cộng và lưu file với tên chứa mã lô', async () => {
    await exportIssueToPdf(selectedItem, lineItems, formValues);

    const tableConfig = autoTableMock.mock.calls[0][1];
    expect(tableConfig.body).toEqual([
      [1, 'Cao su thành phẩm', 'TP001', 'Kg', 40, '50.000', '2.000.000'],
    ]);
    expect(tableConfig.foot[0]).toEqual([
      { content: 'Cộng', colSpan: 4, styles: { halign: 'right' } },
      40,
      '',
      '2.000.000',
    ]);

    expect(saveMock).toHaveBeenCalledWith('Phieu_xuat_kho_ISS001.pdf');
  });
});
