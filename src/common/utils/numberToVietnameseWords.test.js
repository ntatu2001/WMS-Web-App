import { describe, it, expect } from 'vitest';
import { numberToVietnameseWords } from './numberToVietnameseWords';

describe('numberToVietnameseWords', () => {
  it('trả về "Không đồng" khi số bằng 0', () => {
    expect(numberToVietnameseWords(0)).toBe('Không đồng');
  });

  it('đọc đúng số có hàng chục đặc biệt (mười, mốt, lăm)', () => {
    expect(numberToVietnameseWords(15)).toBe('Mười lăm đồng');
    expect(numberToVietnameseWords(21)).toBe('Hai mươi mốt đồng');
    expect(numberToVietnameseWords(25)).toBe('Hai mươi lăm đồng');
  });

  it('chêm "không trăm"/"lẻ" đúng hàng vị', () => {
    expect(numberToVietnameseWords(105)).toBe('Một trăm lẻ năm đồng');
    expect(numberToVietnameseWords(1050502)).toBe(
      'Một triệu không trăm năm mươi nghìn năm trăm lẻ hai đồng'
    );
  });

  it('bỏ qua nhóm hoàn toàn bằng 0 ở giữa', () => {
    expect(numberToVietnameseWords(1000502)).toBe('Một triệu năm trăm lẻ hai đồng');
  });

  it('đọc đúng số tròn nghìn/triệu/tỷ', () => {
    expect(numberToVietnameseWords(2000)).toBe('Hai nghìn đồng');
    expect(numberToVietnameseWords(3000000)).toBe('Ba triệu đồng');
    expect(numberToVietnameseWords(1000000000)).toBe('Một tỷ đồng');
  });

  it('làm tròn số thập phân và bỏ qua giá trị âm/không hợp lệ', () => {
    expect(numberToVietnameseWords(1000.6)).toBe('Một nghìn không trăm lẻ một đồng');
    expect(numberToVietnameseWords(-500)).toBe('Năm trăm đồng');
    expect(numberToVietnameseWords(undefined)).toBe('Không đồng');
  });
});
