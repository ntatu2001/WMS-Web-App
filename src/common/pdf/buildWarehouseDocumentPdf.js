// Bộ dựng PDF dùng chung cho các chứng từ kho theo mẫu kế toán (01-VT/02-VT/05-VT
// theo Thông tư 133/2016/TT-BTC): phiếu nhập kho, phiếu xuất kho, biên bản kiểm kê.
// Nạp jsPDF/jspdf-autotable/font Unicode LAZY (giống cách exportReceiptEntriesExcel.js
// lazy-load xlsx-js-style) để không phình bundle chính — chỉ tải khi người dùng thực sự
// bấm "Xuất PDF".
import { COMPANY_INFO } from '../config/companyInfo.js';

const FONT = 'Roboto';
const MARGIN = 14;

function getPageSize(orientation) {
  return orientation === 'landscape' ? { width: 297, height: 210 } : { width: 210, height: 297 };
}

let logoDataUrlPromise = null;
function loadLogoDataUrl() {
  if (!COMPANY_INFO.logoUrl) return Promise.resolve(null);
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(COMPANY_INFO.logoUrl)
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return null;
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => null);
  }
  return logoDataUrlPromise;
}

function drawHeader(doc, page, { formCode, formNote }) {
  const left = MARGIN;
  let y = 16;

  doc.setFont(FONT, 'bold').setFontSize(11);
  doc.text(COMPANY_INFO.name, left, y);
  doc.setFont(FONT, 'normal').setFontSize(8.5);
  y += 4.5;
  doc.text(`Địa chỉ: ${COMPANY_INFO.address}`, left, y, { maxWidth: page.width * 0.55 });
  y += 8;
  doc.text(`MST: ${COMPANY_INFO.taxCode}    ĐT: ${COMPANY_INFO.phone}`, left, y);

  const rightX = page.width - MARGIN;
  doc.setFont(FONT, 'normal').setFontSize(9);
  doc.text(`Mẫu số ${formCode}`, rightX, 16, { align: 'right' });
  doc.setFontSize(7.5);
  doc.text(formNote, rightX, 20.5, { align: 'right', maxWidth: 70 });

  return 32; // Y sau khi vẽ xong header
}

async function drawLogo(doc, page) {
  const dataUrl = await loadLogoDataUrl();
  if (!dataUrl) return;
  try {
    doc.addImage(dataUrl, 'JPEG', page.width - MARGIN - 22, 8, 22, 22 * 0.4);
  } catch {
    // Bỏ qua nếu ảnh lỗi định dạng — không chặn việc xuất PDF.
  }
}

function drawTitleBlock(doc, page, y, { formTitle, documentDate, documentNumber }) {
  doc.setFont(FONT, 'bold').setFontSize(15);
  doc.text(formTitle, page.width / 2, y, { align: 'center' });
  y += 6;
  doc.setFont(FONT, 'normal').setFontSize(9.5);
  doc.text(documentDate, page.width / 2, y, { align: 'center' });
  y += 5;
  if (documentNumber) {
    doc.text(`Số: ${documentNumber}`, page.width / 2, y, { align: 'center' });
    y += 5;
  }
  return y + 3;
}

function drawTwoColumnLines(doc, page, y, linesLeft = [], linesRight = []) {
  const leftX = MARGIN;
  const rightX = page.width / 2 + 5;
  const lineHeight = 5.2;
  const count = Math.max(linesLeft.length, linesRight.length);
  doc.setFont(FONT, 'normal').setFontSize(9.5);
  for (let i = 0; i < count; i++) {
    if (linesLeft[i]) doc.text(linesLeft[i], leftX, y, { maxWidth: page.width / 2 - MARGIN });
    if (linesRight[i]) doc.text(linesRight[i], rightX, y, { maxWidth: page.width / 2 - MARGIN });
    y += lineHeight;
  }
  return y + 2;
}

function ensureSpace(doc, page, y, needed) {
  if (y + needed > page.height - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function drawTotalsAndSignatures(doc, page, y, { totalAmountWords, originalDocsNote, signatureDateLine, signatureBlocks }) {
  y = ensureSpace(doc, page, y, 14);
  doc.setFont(FONT, 'normal').setFontSize(9.5);
  if (totalAmountWords) {
    doc.text(`Tổng số tiền (viết bằng chữ): ${totalAmountWords}.`, MARGIN, y, { maxWidth: page.width - MARGIN * 2 });
    y += 6;
  }
  if (originalDocsNote) {
    doc.text(originalDocsNote, MARGIN, y, { maxWidth: page.width - MARGIN * 2 });
    y += 6;
  }

  y = ensureSpace(doc, page, y, 55);
  y += 4;
  if (signatureDateLine) {
    doc.setFont(FONT, 'normal').setFontSize(9.5);
    doc.text(signatureDateLine, page.width - MARGIN, y, { align: 'right' });
    y += 7;
  }

  const colWidth = (page.width - MARGIN * 2) / signatureBlocks.length;
  const titleY = y;
  signatureBlocks.forEach((block, i) => {
    const cx = MARGIN + colWidth * i + colWidth / 2;
    doc.setFont(FONT, 'bold').setFontSize(9.5);
    doc.text(block.title, cx, titleY, { align: 'center', maxWidth: colWidth - 4 });
    doc.setFont(FONT, 'italic').setFontSize(8.5);
    doc.text(block.subtitle || '(Ký, họ tên)', cx, titleY + 5, { align: 'center' });
    if (block.name) {
      doc.setFont(FONT, 'normal').setFontSize(9.5);
      doc.text(block.name, cx, titleY + 28, { align: 'center', maxWidth: colWidth - 4 });
    }
  });

  return titleY + 32;
}

/**
 * @param {object} spec
 * @param {'portrait'|'landscape'} [spec.orientation='portrait']
 * @param {string} spec.formCode - VD: '01-VT'
 * @param {string} spec.formNote - VD: 'Ban hành theo Thông tư số 133/2016/TT-BTC...'
 * @param {string} spec.formTitle - VD: 'PHIẾU NHẬP KHO'
 * @param {string} spec.documentDate - VD: 'Ngày 12 tháng 09 năm 2026'
 * @param {string} [spec.documentNumber]
 * @param {string[]} spec.headerLinesLeft
 * @param {string[]} spec.headerLinesRight
 * @param {{header:string, align?:string, width?:number}[]} spec.columns
 * @param {Array<Array<string|number>>} spec.rows
 * @param {Array<string|number|object>} [spec.footRow]
 * @param {string} [spec.totalAmountWords]
 * @param {string} [spec.originalDocsNote]
 * @param {string} spec.signatureDateLine
 * @param {{title:string, subtitle?:string, name?:string}[]} spec.signatureBlocks
 * @param {string} spec.filename
 */
export async function buildWarehouseDocumentPdf(spec) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  await Promise.all([
    import('./fonts/Roboto-normal.js'),
    import('./fonts/Roboto-bold.js'),
  ]);

  const page = getPageSize(spec.orientation);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: spec.orientation || 'portrait' });
  doc.setFont(FONT, 'normal');

  await drawLogo(doc, page);
  let y = drawHeader(doc, page, spec);
  y = drawTitleBlock(doc, page, y, spec);
  y = drawTwoColumnLines(doc, page, y, spec.headerLinesLeft, spec.headerLinesRight);

  autoTable(doc, {
    startY: y,
    head: [spec.columns.map((c) => c.header)],
    body: spec.rows,
    foot: spec.footRow ? [spec.footRow] : undefined,
    styles: { font: FONT, fontSize: 8.5, cellPadding: 1.6, lineColor: [200, 200, 200] },
    headStyles: { font: FONT, fontStyle: 'bold', fillColor: [31, 78, 121], textColor: 255, halign: 'center' },
    footStyles: { font: FONT, fontStyle: 'bold', fillColor: [242, 246, 252], textColor: 20 },
    columnStyles: Object.fromEntries(
      spec.columns.map((c, i) => [i, { halign: c.align || 'left', cellWidth: c.width }])
    ),
    margin: { left: MARGIN, right: MARGIN },
  });

  const afterTableY = doc.lastAutoTable.finalY + 8;
  drawTotalsAndSignatures(doc, page, afterTableY, spec);

  doc.save(spec.filename);
}
