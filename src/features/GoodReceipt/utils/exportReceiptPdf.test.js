import { describe, it, expect, vi, beforeEach } from 'vitest';

// Giả lập jsPDF/autoTable để không dựng PDF thật (nặng, không cần trong unit test) —
// chỉ cần bắt được đúng dữ liệu (rows/footRow/filename) được truyền vào. Font modules
// (Roboto-normal.js/Roboto-bold.js) tự đăng ký qua `jsPDF.API.events.push`, nên mock
// jsPDF cần có sẵn `.API.events` để không văng lỗi khi các font module đó được import.
const textCalls = [];
const saveMock = vi.fn();
const addImageMock = vi.fn();

function FakeJsPDF() {
  this.lastAutoTable = { finalY: 100 };
}
FakeJsPDF.prototype.setFont = function () { return this; };
FakeJsPDF.prototype.setFontSize = function () { return this; };
FakeJsPDF.prototype.text = function (...args) { textCalls.push(args); return this; };
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

import { exportReceiptToPdf } from './exportReceiptPdf';

beforeEach(() => {
  textCalls.length = 0;
  saveMock.mockClear();
  addImageMock.mockClear();
  autoTableMock.mockClear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
});

describe('exportReceiptToPdf', () => {
  const selectedItem = {
    lotNumber: 'LOT001',
    warehouseName: 'Kho A',
    warehouseID: 'WH-A',
    supplierName: 'NCC Trường Nguyên',
    personName: 'Nguyễn Văn A',
  };

  const lineItems = [
    { id: '1.1', materialName: 'Cao su thô', materialId: 'SP001', unitOfMeasure: 'Kg', quantity: 100 },
    { id: '1.2', materialName: 'Mủ latex', materialId: 'SP002', unitOfMeasure: 'Kg', quantity: 50 },
  ];

  const formValues = {
    debitAccount: '152',
    creditAccount: '331',
    preparerName: 'Trần Thị B',
    documentDate: '2026-09-13',
    unitPrices: { '1.1': 20000, '1.2': 30000 },
    totalAmount: 100 * 20000 + 50 * 30000,
    deliveredBy: 'Lê Văn C',
    docRef: 'HĐ 001 ngày 01/09/2026',
  };

  it('dựng đúng bảng dòng, dòng Cộng và lưu file với tên chứa mã lô', async () => {
    await exportReceiptToPdf(selectedItem, lineItems, formValues);

    expect(autoTableMock).toHaveBeenCalledTimes(1);
    const tableConfig = autoTableMock.mock.calls[0][1];

    expect(tableConfig.body).toEqual([
      [1, 'Cao su thô', 'SP001', 'Kg', 100, '20.000', '2.000.000'],
      [2, 'Mủ latex', 'SP002', 'Kg', 50, '30.000', '1.500.000'],
    ]);
    expect(tableConfig.foot[0][0]).toMatchObject({ content: 'Cộng', colSpan: 4 });
    expect(tableConfig.foot[0]).toEqual([
      { content: 'Cộng', colSpan: 4, styles: { halign: 'right' } },
      150,
      '',
      '3.500.000',
    ]);

    expect(saveMock).toHaveBeenCalledWith('Phieu_nhap_kho_LOT001.pdf');
  });

  it('báo lỗi rõ ràng khi thiếu dữ liệu lô (để caller bắt và hiển thị toast)', async () => {
    await expect(exportReceiptToPdf(null, lineItems, formValues)).rejects.toThrow();
  });
});
