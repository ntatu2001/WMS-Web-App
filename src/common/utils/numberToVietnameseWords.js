// Chuyển một số tiền (VNĐ) sang chữ tiếng Việt, dùng cho dòng "Số tiền viết bằng chữ"
// bắt buộc trên các mẫu chứng từ kế toán (01-VT/02-VT/05-VT).
const ONES = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

// Đọc một nhóm 3 chữ số (0-999). `hasPrecedingGroup` cho biết đã có nhóm/hàng cao hơn
// khác 0 phía trước hay chưa — quyết định có cần chêm "không trăm"/"lẻ" để giữ đúng
// hàng vị hay không (VD: 1.050.502 -> "một triệu không trăm năm mươi nghìn năm trăm lẻ hai").
function readGroup(n, hasPrecedingGroup) {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const tens = Math.floor(rest / 10);
  const unit = rest % 10;
  const words = [];

  if (hundred > 0) {
    words.push(ONES[hundred], 'trăm');
  } else if (hasPrecedingGroup && n > 0) {
    words.push('không', 'trăm');
  }

  if (rest > 0) {
    if (tens === 0) {
      if (hundred > 0 || hasPrecedingGroup) words.push('lẻ');
      words.push(ONES[unit]);
    } else if (tens === 1) {
      words.push('mười');
      if (unit === 5) words.push('lăm');
      else if (unit > 0) words.push(ONES[unit]);
    } else {
      words.push(ONES[tens], 'mươi');
      if (unit === 1) words.push('mốt');
      else if (unit === 5) words.push('lăm');
      else if (unit > 0) words.push(ONES[unit]);
    }
  }

  return words.join(' ');
}

// Từ chỉ hàng lớn cho nhóm thứ i (0 = đơn vị, tính từ phải sang), lặp chu kỳ nghìn/triệu/tỷ.
function groupScaleWord(groupIndex) {
  if (groupIndex === 0) return '';
  const cycle = Math.floor((groupIndex - 1) / 3);
  const posInCycle = (groupIndex - 1) % 3;
  const base = ['nghìn', 'triệu', 'tỷ'][posInCycle];
  return cycle === 0 ? base : `${base}${' tỷ'.repeat(cycle)}`;
}

export function numberToVietnameseWords(amount, currencyLabel = 'đồng') {
  const n = Math.round(Math.abs(Number(amount) || 0));
  if (n === 0) return `Không ${currencyLabel}`.trim();

  const groups = [];
  let remaining = n;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts = [];
  let seenNonZeroGroup = false;
  for (let i = groups.length - 1; i >= 0; i--) {
    const value = groups[i];
    if (value === 0) continue;
    const groupWords = readGroup(value, seenNonZeroGroup);
    const scale = groupScaleWord(i);
    parts.push(scale ? `${groupWords} ${scale}` : groupWords);
    seenNonZeroGroup = true;
  }

  const sentence = parts.join(' ').replace(/\s+/g, ' ').trim();
  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return `${capitalized} ${currencyLabel}`.trim();
}
