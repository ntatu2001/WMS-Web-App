// Tiện ích chung: xuất một bảng (đã chuẩn bị sẵn header + rows) ra file .xlsx có định dạng.
// Dùng xlsx-js-style (fork SheetJS có hỗ trợ style) nạp động để không gộp vào bundle chính.

const COLOR = {
  headerFill: '1F4E79', // xanh navy - đồng bộ nút chính của app
  headerText: 'FFFFFF',
  border: 'D0D7DE',     // xám nhạt
  stripe: 'F2F6FC',     // nền dòng chẵn
};

const THIN = { style: 'thin', color: { rgb: COLOR.border } };
const ALL_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

/**
 * @param {Object}   opts
 * @param {string[]} opts.headers      - nhãn cột (bao gồm cả cột STT nếu có).
 * @param {Array<Array<string|number>>} opts.rows - dữ liệu, mỗi phần tử là 1 dòng đã theo đúng thứ tự cột.
 * @param {Array<{width?:number, align?:'left'|'center'|'right', numFmt?:string}>} [opts.columnMeta]
 * @param {string}   [opts.sheetName]  - tên sheet (<= 31 ký tự).
 * @param {string}   [opts.filename]   - tên file .xlsx sẽ tải về.
 */
export async function exportTableToExcel({
  headers,
  rows,
  columnMeta = [],
  sheetName = 'Sheet1',
  filename = 'export.xlsx',
}) {
  const XLSX = await import('xlsx-js-style');

  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!cols'] = headers.map((_, c) => ({ wch: columnMeta[c]?.width ?? 16 }));
  ws['!rows'] = [{ hpt: 24 }]; // chiều cao dòng tiêu đề
  ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

  const headerStyle = {
    font: { bold: true, sz: 11, color: { rgb: COLOR.headerText } },
    fill: { fgColor: { rgb: COLOR.headerFill } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: ALL_BORDERS,
  };

  for (let r = 0; r < aoa.length; r++) {
    const isHeader = r === 0;
    const stripe = !isHeader && r % 2 === 0;
    for (let c = 0; c < headers.length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };

      if (isHeader) {
        ws[addr].s = headerStyle;
        continue;
      }

      const meta = columnMeta[c] || {};
      const style = {
        alignment: { vertical: 'center', horizontal: meta.align || 'left' },
        border: ALL_BORDERS,
      };
      if (stripe) style.fill = { fgColor: { rgb: COLOR.stripe } };
      if (meta.numFmt && typeof ws[addr].v === 'number') style.numFmt = meta.numFmt;
      ws[addr].s = style;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

/** Chuỗi thời gian yyyymmdd_hhmm để gắn vào tên file. */
export function excelStamp(d = new Date()) {
  const p2 = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}_${p2(d.getHours())}${p2(d.getMinutes())}`;
}
