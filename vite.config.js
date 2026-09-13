import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
// https://vitejs.dev/config/
// base: './' (relative) là chủ ý cho production thật, để app chạy được khi host ở bất kỳ
// subpath/file:// nào mà không cần biết trước — HashRouter (xem src/main.jsx) bù lại phần
// điều hướng sâu vì URL thật luôn ở "/". Khi ép BrowserRouter cho E2E (VITE_ROUTER_MODE=
// browser), base tương đối làm asset 404 ở path lồng từ 2 cấp trở lên (vd /setting/users,
// vì "./assets" resolve sai theo độ sâu URL) nên phải chuyển sang base tuyệt đối '/'.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_ROUTER_MODE === 'browser' ? '/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
