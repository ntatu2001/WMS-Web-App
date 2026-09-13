// Cắt bỏ viền trắng thừa quanh logo Trường Nguyên (ảnh gốc có nền trắng rộng bao quanh
// logo hình vuông ở giữa) để logo hiển thị vừa khung trong Sidebar/Login thay vì bị thu
// nhỏ lọt thỏm. Script dùng 1 lần, không phải một phần của build pipeline.
import sharp from 'sharp';

const src = 'UserGuide/Truong_Nguyen_Rubber_Logo.jpg';
const out = 'src/assets/truong_nguyen_logo.png';

const image = sharp(src);
const meta = await image.metadata();
console.log('original size', meta.width, meta.height);

const trimmed = sharp(src).trim({ threshold: 10 });
const buffer = await trimmed.png().toBuffer();
const trimmedMeta = await sharp(buffer).metadata();
console.log('trimmed size', trimmedMeta.width, trimmedMeta.height);

await sharp(buffer).toFile(out);
console.log('wrote', out);
