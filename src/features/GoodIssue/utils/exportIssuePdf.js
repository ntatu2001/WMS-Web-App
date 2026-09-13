// Xuất "Phiếu xuất kho" (Mẫu 02-VT, Thông tư 133/2016/TT-BTC) ra PDF cho MỘT lô xuất
// đã chọn ở màn Lịch sử xuất kho. Nội dung chứng từ luôn cố định bằng tiếng Việt theo
// đúng mẫu kế toán, không phụ thuộc ngôn ngữ hiển thị.
import { buildWarehouseDocumentPdf } from '../../../common/pdf/buildWarehouseDocumentPdf.js';
import { numberToVietnameseWords } from '../../../common/utils/numberToVietnameseWords.js';
import { formatDocumentDateLine, formatSignatureDateLine } from '../../../common/pdf/vietnameseDate.js';
import { COMPANY_INFO } from '../../../common/config/companyInfo.js';

const money = (n) => (Number(n) || 0).toLocaleString('vi-VN');

/**
 * @param {object} selectedItem - bản ghi lô đang chọn ở IssueHistory (warehouseName, lotNumber, customerName, personName, issueDate...).
 * @param {Array<{id:string|number, materialName:string, materialId:string, unitOfMeasure:string, quantity:number}>} lineItems
 * @param {object} formValues - dữ liệu nhập tại PdfExportFieldsModal (debitAccount, creditAccount, preparerName, documentDate, unitPrices, totalAmount, receivedBy, reason).
 */
export async function exportIssueToPdf(selectedItem, lineItems, formValues) {
  const columns = [
    { header: 'STT', align: 'center', width: 8 },
    { header: 'Tên vật tư, sản phẩm, hàng hoá', align: 'left' },
    { header: 'Mã số', align: 'center', width: 20 },
    { header: 'ĐVT', align: 'center', width: 12 },
    { header: 'Số lượng', align: 'center', width: 16 },
    { header: 'Đơn giá', align: 'right', width: 22 },
    { header: 'Thành tiền', align: 'right', width: 26 },
  ];

  const rows = lineItems.map((item, i) => {
    const price = Number(formValues.unitPrices[item.id]) || 0;
    const qty = Number(item.quantity) || 0;
    return [i + 1, item.materialName || '', item.materialId || '', item.unitOfMeasure || '', qty, money(price), money(price * qty)];
  });

  const totalQty = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const footRow = [
    { content: 'Cộng', colSpan: 4, styles: { halign: 'right' } },
    totalQty,
    '',
    money(formValues.totalAmount),
  ];

  await buildWarehouseDocumentPdf({
    formCode: '02-VT',
    formNote: 'Ban hành theo Thông tư số 133/2016/TT-BTC ngày 26/8/2016 của Bộ Tài chính',
    formTitle: 'PHIẾU XUẤT KHO',
    documentDate: formatDocumentDateLine(formValues.documentDate),
    documentNumber: selectedItem.lotNumber,
    headerLinesLeft: [
      `Họ và tên người nhận hàng: ${formValues.receivedBy || '...'}`,
      `Lý do xuất kho: ${formValues.reason || '...'}`,
      `Xuất tại kho: ${selectedItem.warehouseName || '...'}    Địa điểm: ${selectedItem.warehouseID || '...'}`,
    ],
    headerLinesRight: [
      `Nợ TK: ${formValues.debitAccount || '...'}`,
      `Có TK: ${formValues.creditAccount || '...'}`,
      `Khách hàng: ${selectedItem.customerName || '...'}`,
    ],
    columns,
    rows,
    footRow,
    totalAmountWords: numberToVietnameseWords(formValues.totalAmount),
    originalDocsNote: 'Số chứng từ gốc kèm theo: ......................................',
    signatureDateLine: formatSignatureDateLine(formValues.documentDate, COMPANY_INFO.cityLabel),
    signatureBlocks: [
      { title: 'Người lập phiếu', name: formValues.preparerName || selectedItem.personName },
      { title: 'Người nhận hàng', name: formValues.receivedBy },
      { title: 'Thủ kho', name: '' },
      { title: 'Kế toán trưởng', name: '' },
    ],
    filename: `Phieu_xuat_kho_${selectedItem.lotNumber || 'export'}.pdf`.replace(/\s+/g, '_'),
  });
}
