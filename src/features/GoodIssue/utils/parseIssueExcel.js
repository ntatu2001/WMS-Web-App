// Đọc file Excel phiếu xuất kho theo mẫu ExcelTemplate/Template_Xuat_Kho.xlsx.
// Hàm thuần: chỉ bóc tách cấu trúc + báo lỗi cấu trúc (không đọc được file, sai sheet,
// thiếu cột, thiếu nhãn phần A). Việc đối chiếu danh mục (kho/khách hàng/nhân viên/sản phẩm),
// kiểm tra lô tồn kho, số lượng... do phía component xử lý vì cần dữ liệu đã tải + gọi API.

const SHEET_NAME = 'Phieu Xuat Kho';

const stripStar = (s) => String(s ?? '').replace(/\(\s*\*\s*\)/g, '').trim();
const norm = (s) => stripStar(s).toLowerCase();

// key -> nhãn (đã chuẩn hoá) ở cột B của phần A
const A_LABELS = {
  warehouseName: 'kho hàng',
  warehouseCode: 'mã kho hàng',
  customerName: 'khách hàng',
  employeeName: 'nhân viên',
  dateText: 'ngày xuất kho',
};

const A_LABEL_TEXT = {
  warehouseName: 'Kho hàng',
  warehouseCode: 'Mã kho hàng',
  customerName: 'Khách hàng',
  employeeName: 'Nhân viên',
  dateText: 'Ngày xuất kho',
};

/**
 * "dd/mm/yyyy" -> Date (00:00 giờ địa phương), hoặc null nếu không hợp lệ.
 */
export const parseDmY = (s) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s ?? '').trim());
  if (!m) return null;
  const d = +m[1];
  const mo = +m[2];
  const y = +m[3];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
};

/**
 * @param {File} file
 * @returns {Promise<
 *   | { header: { warehouseName, warehouseCode, customerName, employeeName, dateText }, items: Item[] }
 *   | { errors: string[] }
 * >}
 * Item = { rowNumber, productName, productCode, unit, lotNumber, quantity, note }
 *   rowNumber: số dòng 1-based trên sheet (dùng cho thông báo lỗi)
 *   quantity : giữ nguyên chuỗi đã trim (kiểm tra số ở component)
 */
export async function parseIssueExcel(file) {
  let grid;
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const ws =
      wb.Sheets[SHEET_NAME] ||
      wb.Sheets[wb.SheetNames.find((n) => norm(n) === norm(SHEET_NAME))];
    if (!ws) {
      return { errors: [`Không tìm thấy sheet "${SHEET_NAME}" trong file. Vui lòng dùng đúng file mẫu.`] };
    }
    grid = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  } catch {
    return { errors: ['Không đọc được file Excel. Vui lòng dùng đúng file .xlsx theo mẫu.'] };
  }

  const errors = [];
  const header = {};

  // --- Phần A: cột B (idx 1) = nhãn, cột C (idx 2) = giá trị ---
  for (const row of grid) {
    const label = norm(row[1]);
    if (!label) continue;
    for (const [key, want] of Object.entries(A_LABELS)) {
      if (label === want) header[key] = String(row[2] ?? '').trim();
    }
  }
  for (const key of Object.keys(A_LABELS)) {
    if (!header[key]) errors.push(`Mục A: thiếu giá trị cho "${A_LABEL_TEXT[key]}".`);
  }

  // --- Phần B: tìm dòng tiêu đề bảng theo nội dung (chịu được chèn/xoá dòng) ---
  const headerRowIdx = grid.findIndex((r) => {
    const cells = r.map(norm);
    return cells.some((c) => c.includes('tên sản phẩm')) && cells.some((c) => c.includes('sl xuất'));
  });
  if (headerRowIdx === -1) {
    errors.push('Không tìm thấy bảng "Danh sách sản phẩm xuất kho" trong file.');
    return { errors };
  }

  const h = grid[headerRowIdx].map(norm);
  const col = {
    productName: h.findIndex((c) => c.includes('tên sản phẩm')),
    productCode: h.findIndex((c) => c.includes('mã sản phẩm')),
    unit: h.findIndex((c) => c.includes('đvt')),
    lotNumber: h.findIndex((c) => c.includes('mã lô')),
    quantity: h.findIndex((c) => c.includes('sl xuất')),
    note: h.findIndex((c) => c.includes('ghi chú')),
  };
  if (col.productName === -1 || col.quantity === -1 || col.lotNumber === -1) {
    errors.push('Bảng sản phẩm trong file thiếu cột bắt buộc (Tên sản phẩm / Mã lô / SL xuất).');
    return { errors };
  }

  // --- Dòng dữ liệu: bỏ dòng trống (Tên SP + SL xuất + Mã lô đều rỗng; STT bỏ qua) ---
  const items = [];
  for (let i = headerRowIdx + 1; i < grid.length; i++) {
    const r = grid[i];
    const get = (idx) => (idx > -1 ? String(r[idx] ?? '').trim() : '');
    const productName = get(col.productName);
    const quantity = get(col.quantity);
    const lotNumber = get(col.lotNumber);
    if (!productName && !quantity && !lotNumber) continue;
    items.push({
      rowNumber: i + 1,
      productName,
      productCode: get(col.productCode),
      unit: get(col.unit),
      lotNumber,
      quantity,
      note: get(col.note),
    });
  }

  if (errors.length) return { errors };
  return { header, items };
}
