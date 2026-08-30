// Xuất danh sách lô hàng nhập kho (đã lọc, KHÔNG phân trang) ra file .xlsx có định dạng.
// Dùng xlsx-js-style (fork của SheetJS có hỗ trợ style) nạp động để không gộp vào bundle chính.
import { lotStatusChangeData, lotStatusData } from '../../../app/mockData/LotStatusData.js';

const HEADER = [
  'STT', 'Tên sản phẩm', 'Mã sản phẩm', 'Mã lô/Số PO', 'Số lượng nhập',
  'Ngày nhập kho', 'Kho hàng', 'Tiến độ',
];

const COLOR = {
  headerFill: '1F4E79', // xanh navy - đồng bộ nút chính của app
  headerText: 'FFFFFF',
  border: 'D0D7DE',     // xám nhạt
  stripe: 'F2F6FC',     // nền dòng chẵn
};

const THIN = { style: 'thin', color: { rgb: COLOR.border } };
const ALL_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

// cột (0-based) căn giữa / căn phải
const CENTER_COLS = new Set([0, 3, 5, 7]); // STT, Mã lô, Ngày, Tiến độ
const RIGHT_COLS = new Set([4]);           // Số lượng nhập

const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
};

/**
 * @param {Array} entries - mảng InventoryReceiptEntryDTO đã gộp/dedupe.
 * @param {string} filename - tên file .xlsx sẽ tải về.
 */
export async function exportReceiptEntriesToExcel(entries, filename = 'Lo_hang_nhap_kho.xlsx') {
  const XLSX = await import('xlsx-js-style');

  const aoa = [
    HEADER,
    ...entries.map((it, i) => {
      const qty = it.receiptLot?.importedQuantity;
      return [
        i + 1,
        it.materialName ?? '',
        it.materialId ?? '',
        it.lotNumber ?? '',
        typeof qty === 'number' ? qty : (qty ?? ''),
        fmtDate(it.receiptDate),
        it.warehouseName ?? '',
        lotStatusChangeData[it.receiptLot?.receiptLotStatus] ?? it.receiptLot?.receiptLotStatus ?? '',
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [
    { wch: 5 }, { wch: 40 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 22 }, { wch: 16 },
  ];
  ws['!rows'] = [{ hpt: 24 }]; // chiều cao dòng tiêu đề
  ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(HEADER.length - 1)}1` };

  const headerStyle = {
    font: { bold: true, sz: 11, color: { rgb: COLOR.headerText } },
    fill: { fgColor: { rgb: COLOR.headerFill } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: ALL_BORDERS,
  };

  for (let r = 0; r < aoa.length; r++) {
    const isHeader = r === 0;
    const stripe = !isHeader && r % 2 === 0;
    for (let c = 0; c < HEADER.length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };

      if (isHeader) {
        ws[addr].s = headerStyle;
        continue;
      }

      const style = {
        alignment: {
          vertical: 'center',
          horizontal: CENTER_COLS.has(c) ? 'center' : RIGHT_COLS.has(c) ? 'right' : 'left',
        },
        border: ALL_BORDERS,
      };
      if (stripe) style.fill = { fgColor: { rgb: COLOR.stripe } };
      if (c === 4 && typeof ws[addr].v === 'number') style.numFmt = '#,##0';
      if (c === 7) {
        const hex = lotStatusData[ws[addr].v];
        if (hex) style.font = { bold: true, color: { rgb: hex.replace('#', '').toUpperCase() } };
      }
      ws[addr].s = style;
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lô hàng nhập kho');
  XLSX.writeFile(wb, filename);
}
