// Build 1 workbook .xlsx thật (buffer, không ghi ra đĩa) để test luồng import Excel qua
// UI thật (page.setInputFiles nhận buffer trực tiếp) — cùng cách tiếp cận với các unit
// test parseReceiptExcel/parseIssueExcel: dùng dữ liệu thật thay vì mock thư viện.
import XLSX from 'xlsx-js-style';

export function buildXlsxBuffer(sheetName, rows) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
