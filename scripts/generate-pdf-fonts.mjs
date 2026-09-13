// Chuyển font TTF (Roboto Regular/Bold) sang module JS base64 mà jsPDF có thể nạp qua
// addFileToVFS/addFont, để in được tiếng Việt có dấu trong PDF (font mặc định của jsPDF
// không hỗ trợ Unicode). Script này CHỈ chạy 1 lần thủ công khi cần tạo/regen font module,
// không phải một phần của build pipeline.
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FONTS = [
  { src: 'C:/Users/Admin/AppData/Local/Temp/fonts/Roboto-Regular.ttf', vfsName: 'Roboto-Regular.ttf', style: 'normal', out: 'Roboto-normal.js' },
  { src: 'C:/Users/Admin/AppData/Local/Temp/fonts/Roboto-Bold.ttf', vfsName: 'Roboto-Bold.ttf', style: 'bold', out: 'Roboto-bold.js' },
];

const outDir = path.join(__dirname, '..', 'src', 'common', 'pdf', 'fonts');

for (const font of FONTS) {
  const base64 = readFileSync(font.src).toString('base64');
  const content = `// Tự sinh bởi scripts/generate-pdf-fonts.mjs — KHÔNG sửa tay.
// Font Roboto (Apache License 2.0) nhúng base64 để jsPDF in được tiếng Việt có dấu.
import { jsPDF } from 'jspdf';

const font = '${base64}';

jsPDF.API.events.push(['addFonts', function () {
  this.addFileToVFS('${font.vfsName}', font);
  this.addFont('${font.vfsName}', 'Roboto', '${font.style}');
}]);
`;
  writeFileSync(path.join(outDir, font.out), content, 'utf8');
  console.log(`Wrote ${font.out} (${(base64.length / 1024).toFixed(0)} KB base64)`);
}
