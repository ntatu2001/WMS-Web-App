import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Luôn chạy trên production build (kể cả local), không dùng `npm run dev`: dev mode
    // bọc App trong React.StrictMode nên mount mỗi effect 2 lần, khiến các test đếm số
    // lần gọi API (vd retry sau 401) chạy đúng ở CI nhưng flaky lúc chạy dev cục bộ.
    command: 'npm run build && npm run preview -- --port ' + PORT,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    // Ép baseURL của axiosClient thành đường dẫn tương đối (cùng origin với page) thay
    // vì giá trị thật trong .env (khác origin, vd localhost:5037) — mọi request API trong
    // E2E đều bị page.route() mock lại nên không cần backend thật, và cùng origin giúp
    // tránh hẳn vấn đề CORS khi mock response cho request cross-origin.
    env: { VITE_API_BASE_URL: '/api/', VITE_ROUTER_MODE: 'browser' },
  },
});
