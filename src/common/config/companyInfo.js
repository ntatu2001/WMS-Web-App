// Thông tin công ty hiển thị trên tiêu đề các chứng từ PDF (phiếu nhập/xuất kho,
// biên bản kiểm kê) và trên giao diện (trang Login, Sidebar). Đây là nguồn duy nhất
// cần sửa nếu thông tin công ty thay đổi.
export const COMPANY_INFO = {
  name: 'CÔNG TY CỔ PHẦN CAO SU TRƯỜNG NGUYÊN',
  nameEn: 'TRUONG NGUYEN RUBBER JOINT STOCK COMPANY',
  shortNameEn: 'TRUONG NGUYEN RUBBER',
  taxCode: '0318999123',
  address: 'Lô C15-16, Đường số 4, Khu công nghiệp Hiệp Phước, Xã Hiệp Phước, Huyện Nhà Bè, TP. Hồ Chí Minh',
  cityLabel: 'TP. Hồ Chí Minh', // dùng cho dòng "..., ngày ... tháng ... năm ..." trên chứng từ PDF
  phone: '028 3780 9999',
  // Phục vụ tĩnh từ public/, jsPDF nạp qua fetch() lúc build PDF (xem buildWarehouseDocumentPdf.js).
  logoUrl: '/company-logo.jpg',
};
