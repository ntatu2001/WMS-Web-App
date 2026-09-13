// Helper dùng chung cho các unit test đọc file Excel (parseReceiptExcel/parseIssueExcel):
// build 1 workbook .xlsx thật bằng xlsx-js-style rồi bọc thành File, thay vì mock thư viện,
// để test đúng contract parse thật sự.
export async function buildXlsxFile(sheetName, rows, fileName = 'test.xlsx') {
  const XLSX = await import('xlsx-js-style');
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([buffer], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// Bytes mở đầu bằng magic number của ZIP (0x50 0x4B 0x03 0x04) để buộc XLSX.read
// nhận diện đây là định dạng xlsx/zip rồi thất bại khi giải nén nội dung rác phía sau,
// thay vì âm thầm fallback sang parser CSV/text (không throw) như với text thuần.
export function corruptFile(fileName = 'corrupt.xlsx') {
  const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
  return new File([bytes], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
