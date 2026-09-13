import { describe, it, expect } from 'vitest';
import { parseDmY, parseIssueExcel } from './parseIssueExcel';
import { buildXlsxFile, corruptFile } from '../../../test/xlsxTestUtils';

const SHEET_NAME = 'Phieu Xuat Kho';

const validAoa = [
  ['PHIẾU XUẤT KHO'],
  ['', 'Kho hàng (*)', 'Kho A'],
  ['', 'Mã kho hàng (*)', 'KHO001'],
  ['', 'Khách hàng (*)', 'KH A'],
  ['', 'Nhân viên (*)', 'NV001'],
  ['', 'Ngày xuất kho (*)', '01/01/2024'],
  [],
  ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'ĐVT', 'Mã lô', 'SL xuất', 'Ghi chú'],
  [1, 'Sản phẩm A', 'SP001', 'Cái', 'LOT001', '10', ''],
  ['', '', '', '', '', '', ''],
  [2, 'Sản phẩm B', 'SP002', 'Cái', 'LOT002', '20', 'Ghi chú B'],
];

describe('parseDmY', () => {
  it('parse đúng ngày hợp lệ dd/mm/yyyy', () => {
    const d = parseDmY('05/03/2024');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(5);
  });

  it('trả về null cho ngày không tồn tại trên lịch (31/02)', () => {
    expect(parseDmY('31/02/2024')).toBeNull();
  });

  it('trả về null cho chuỗi rác hoặc rỗng', () => {
    expect(parseDmY('không phải ngày')).toBeNull();
    expect(parseDmY('')).toBeNull();
  });
});

describe('parseIssueExcel', () => {
  it('parse thành công file đúng mẫu', async () => {
    const file = await buildXlsxFile(SHEET_NAME, validAoa);
    const result = await parseIssueExcel(file);

    expect(result.errors).toBeUndefined();
    expect(result.header).toEqual({
      warehouseName: 'Kho A',
      warehouseCode: 'KHO001',
      customerName: 'KH A',
      employeeName: 'NV001',
      dateText: '01/01/2024',
    });
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      rowNumber: 9,
      productName: 'Sản phẩm A',
      productCode: 'SP001',
      unit: 'Cái',
      lotNumber: 'LOT001',
      quantity: '10',
      note: '',
    });
    // dòng trống ở giữa bảng phải được bỏ qua, rowNumber vẫn phản ánh đúng vị trí gốc.
    expect(result.items[1].rowNumber).toBe(11);
  });

  it('báo lỗi khi sai tên sheet', async () => {
    const file = await buildXlsxFile('Sheet Sai Ten', validAoa);
    const result = await parseIssueExcel(file);

    expect(result.errors).toEqual([
      `Không tìm thấy sheet "${SHEET_NAME}" trong file. Vui lòng dùng đúng file mẫu.`,
    ]);
  });

  it('báo lỗi khi thiếu nhãn bắt buộc ở Phần A (Khách hàng)', async () => {
    const aoa = validAoa.filter((row) => norm(row[1]) !== 'khách hàng');
    const file = await buildXlsxFile(SHEET_NAME, aoa);
    const result = await parseIssueExcel(file);

    expect(result.errors).toContain('Mục A: thiếu giá trị cho "Khách hàng".');
  });

  it('báo lỗi khi không tìm thấy bảng danh sách sản phẩm', async () => {
    const aoa = validAoa.slice(0, 7);
    const file = await buildXlsxFile(SHEET_NAME, aoa);
    const result = await parseIssueExcel(file);

    expect(result.errors).toEqual([
      'Không tìm thấy bảng "Danh sách sản phẩm xuất kho" trong file.',
    ]);
  });

  it('báo lỗi khi bảng thiếu cột bắt buộc (thiếu cột Mã lô)', async () => {
    const aoa = validAoa.map((row) => [...row]);
    aoa[7] = ['STT', 'Tên sản phẩm', 'Mã sản phẩm', 'ĐVT', 'SL xuất', 'Ghi chú'];
    const file = await buildXlsxFile(SHEET_NAME, aoa);
    const result = await parseIssueExcel(file);

    expect(result.errors).toEqual([
      'Bảng sản phẩm trong file thiếu cột bắt buộc (Tên sản phẩm / Mã lô / SL xuất).',
    ]);
  });

  it('báo lỗi chung khi file không phải .xlsx hợp lệ', async () => {
    const result = await parseIssueExcel(corruptFile());

    expect(result.errors).toEqual([
      'Không đọc được file Excel. Vui lòng dùng đúng file .xlsx theo mẫu.',
    ]);
  });
});

function norm(s) {
  return String(s ?? '')
    .replace(/\(\s*\*\s*\)/g, '')
    .trim()
    .toLowerCase();
}
