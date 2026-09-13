// Định dạng ngày kiểu văn bản hành chính Việt Nam, dùng trong các mẫu chứng từ PDF.
const pad2 = (n) => String(n).padStart(2, '0');

function toDateParts(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const date = Number.isNaN(d.getTime()) ? new Date() : d;
  return { day: pad2(date.getDate()), month: pad2(date.getMonth() + 1), year: date.getFullYear() };
}

export function formatDocumentDateLine(dateInput) {
  const { day, month, year } = toDateParts(dateInput);
  return `Ngày ${day} tháng ${month} năm ${year}`;
}

export function formatSignatureDateLine(dateInput, cityLabel) {
  const { day, month, year } = toDateParts(dateInput);
  const prefix = cityLabel ? `${cityLabel}, ` : '';
  return `${prefix}ngày ${day} tháng ${month} năm ${year}`;
}
