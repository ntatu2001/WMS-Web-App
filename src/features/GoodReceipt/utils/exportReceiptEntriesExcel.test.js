import { describe, it, expect, vi, beforeEach } from 'vitest';

// Giữ nguyên toàn bộ xlsx-js-style thật (aoa_to_sheet, book_new, encode_cell...),
// chỉ thay writeFile bằng spy để không ghi file thật ra đĩa trong lúc test. Với
// importOriginal() ở gói CJS này, namespace trả về CHỈ có { default, 'module.exports' }
// (không tự sinh named export như lúc import() bình thường) — nên phải lấy từ
// actual.default rồi trải phẳng lại cả 2 chỗ để khớp mọi kiểu truy cập XLSX.xxx.
vi.mock('xlsx-js-style', async (importOriginal) => {
  const actual = await importOriginal();
  const patched = { ...actual.default, writeFile: vi.fn() };
  return { ...patched, default: patched };
});

import * as XLSX from 'xlsx-js-style';
import { exportReceiptEntriesToExcel } from './exportReceiptEntriesExcel';

beforeEach(() => {
  XLSX.writeFile.mockClear();
});

function readBackRows() {
  const [wb] = XLSX.writeFile.mock.calls[0];
  const ws = wb.Sheets[wb.SheetNames[0]];
  return { wb, rows: XLSX.utils.sheet_to_json(ws, { header: 1 }) };
}

describe('exportReceiptEntriesToExcel', () => {
  it('xuất đúng header và dữ liệu dòng theo entries (tiếng Việt)', async () => {
    const entries = [
      {
        materialName: 'Sản phẩm A',
        materialId: 'SP001',
        lotNumber: 'LOT001',
        receiptLot: { importedQuantity: 10, receiptLotStatus: 'Done' },
        receiptDate: '2024-01-01T00:00:00Z',
        warehouseName: 'Kho A',
      },
    ];

    await exportReceiptEntriesToExcel(entries, 'test.xlsx', 'vi');

    expect(XLSX.writeFile).toHaveBeenCalledTimes(1);
    const [wb, filename] = XLSX.writeFile.mock.calls[0];
    expect(filename).toBe('test.xlsx');
    expect(wb.SheetNames[0]).toBe('Thông tin lô hàng nhập kho');

    const { rows } = readBackRows();
    expect(rows).toHaveLength(2); // header + 1 dòng dữ liệu
    expect(rows[0][0]).toBe('STT');
    expect(rows[0][1]).toBe('Tên sản phẩm');
    expect(rows[1]).toEqual([
      1,
      'Sản phẩm A',
      'SP001',
      'LOT001',
      10,
      expect.any(String),
      'Kho A',
      'Hoàn thành',
    ]);
  });

  it('mảng entries rỗng vẫn tạo workbook hợp lệ chỉ có dòng header', async () => {
    await exportReceiptEntriesToExcel([], 'empty.xlsx', 'vi');

    const { rows } = readBackRows();
    expect(rows).toHaveLength(1);
    expect(rows[0][0]).toBe('STT');
  });

  it('trạng thái lô không nằm trong danh mục thì giữ nguyên chuỗi gốc', async () => {
    const entries = [
      {
        materialName: 'Sản phẩm B',
        receiptLot: { importedQuantity: 5, receiptLotStatus: 'UnknownStatus' },
      },
    ];

    await exportReceiptEntriesToExcel(entries, 'test.xlsx', 'vi');

    const { rows } = readBackRows();
    expect(rows[1][7]).toBe('UnknownStatus');
  });
});
