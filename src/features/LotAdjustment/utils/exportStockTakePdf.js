// Xuất "Biên bản kiểm kê vật tư, sản phẩm, hàng hoá" (Mẫu 05-VT, Thông tư
// 133/2016/TT-BTC) ra PDF cho MỘT lô kiểm kê đã chọn ở màn Lịch sử kiểm kê. Nội dung
// chứng từ luôn cố định bằng tiếng Việt theo đúng mẫu kế toán, không phụ thuộc ngôn ngữ
// hiển thị. In khổ ngang (landscape) vì mẫu có nhiều cột (sổ sách/kiểm kê/chênh lệch).
import { buildWarehouseDocumentPdf } from '../../../common/pdf/buildWarehouseDocumentPdf.js';
import { formatDocumentDateLine, formatSignatureDateLine } from '../../../common/pdf/vietnameseDate.js';
import { COMPANY_INFO } from '../../../common/config/companyInfo.js';

const money = (n) => (Number(n) || 0).toLocaleString('vi-VN');

/**
 * @param {object} selectedItem - bản ghi lô đang chọn ở InventoryHistory (warehouseName, lotNumber, personName, adjustmentDate...).
 * @param {Array<{id:string|number, materialName:string, materialId:string, unitOfMeasure:string, previousQuantity:number, realAdjustmentQuantity:number, quantityDifference:number}>} lineItems
 * @param {object} formValues - dữ liệu nhập tại PdfExportFieldsModal (preparerName, documentDate, unitPrices, committeeMembers, proposal).
 */
export async function exportStockTakeToPdf(selectedItem, lineItems, formValues) {
  const columns = [
    { header: 'STT', align: 'center', width: 8 },
    { header: 'Tên vật tư, sản phẩm, hàng hoá', align: 'left' },
    { header: 'Mã số', align: 'center', width: 18 },
    { header: 'ĐVT', align: 'center', width: 10 },
    { header: 'Đơn giá', align: 'right', width: 18 },
    { header: 'SL sổ sách', align: 'center', width: 16 },
    { header: 'TT sổ sách', align: 'right', width: 20 },
    { header: 'SL kiểm kê', align: 'center', width: 16 },
    { header: 'TT kiểm kê', align: 'right', width: 20 },
    { header: 'Chênh lệch SL', align: 'center', width: 18 },
    { header: 'Chênh lệch TT', align: 'right', width: 20 },
  ];

  let totalBookQty = 0, totalBookAmount = 0, totalActualQty = 0, totalActualAmount = 0, totalDiffQty = 0, totalDiffAmount = 0;

  const rows = lineItems.map((item, i) => {
    const price = Number(formValues.unitPrices[item.id]) || 0;
    const bookQty = Number(item.previousQuantity) || 0;
    const actualQty = Number(item.realAdjustmentQuantity) || 0;
    const diffQty = item.quantityDifference != null ? Number(item.quantityDifference) : actualQty - bookQty;
    const bookAmount = price * bookQty;
    const actualAmount = price * actualQty;
    const diffAmount = price * diffQty;

    totalBookQty += bookQty;
    totalBookAmount += bookAmount;
    totalActualQty += actualQty;
    totalActualAmount += actualAmount;
    totalDiffQty += diffQty;
    totalDiffAmount += diffAmount;

    return [
      i + 1,
      item.materialName || '',
      item.materialId || '',
      item.unitOfMeasure || '',
      money(price),
      bookQty,
      money(bookAmount),
      actualQty,
      money(actualAmount),
      diffQty,
      money(diffAmount),
    ];
  });

  const footRow = [
    { content: 'Cộng', colSpan: 5, styles: { halign: 'right' } },
    totalBookQty,
    money(totalBookAmount),
    totalActualQty,
    money(totalActualAmount),
    totalDiffQty,
    money(totalDiffAmount),
  ];

  const committeeLines = (formValues.committeeMembers || [])
    .filter((m) => m.name && m.name.trim())
    .map((m) => `- ${m.name}${m.role ? ` (${m.role})` : ''}`);

  const signatureBlocks = [
    { title: 'Trưởng ban kiểm kê', name: formValues.preparerName || selectedItem.personName },
    { title: 'Thủ kho', name: '' },
    { title: 'Kế toán trưởng', name: '' },
    { title: 'Giám đốc', name: '' },
  ];

  await buildWarehouseDocumentPdf({
    orientation: 'landscape',
    formCode: '05-VT',
    formNote: 'Ban hành theo Thông tư số 133/2016/TT-BTC ngày 26/8/2016 của Bộ Tài chính',
    formTitle: 'BIÊN BẢN KIỂM KÊ VẬT TƯ, SẢN PHẨM, HÀNG HOÁ',
    documentDate: formatDocumentDateLine(formValues.documentDate),
    documentNumber: selectedItem.lotNumber,
    headerLinesLeft: [
      `Thời điểm kiểm kê: ${formatDocumentDateLine(formValues.documentDate)}`,
      `Kho kiểm kê: ${selectedItem.warehouseName || '...'}    Khu vực: ${selectedItem.warehouseID || '...'}`,
      ...(committeeLines.length ? ['Ban kiểm kê gồm:', ...committeeLines] : ['Ban kiểm kê gồm: ...']),
    ],
    headerLinesRight: formValues.proposal ? [`Ý kiến đề xuất: ${formValues.proposal}`] : [],
    columns,
    rows,
    footRow,
    signatureDateLine: formatSignatureDateLine(formValues.documentDate, COMPANY_INFO.cityLabel),
    signatureBlocks,
    filename: `Bien_ban_kiem_ke_${selectedItem.lotNumber || 'export'}.pdf`.replace(/\s+/g, '_'),
  });
}
