// Helper mock API dùng chung cho mọi E2E spec. VITE_API_BASE_URL được ép về '/api/'
// (xem playwright.config.js) nên mọi request đều cùng origin với page — pattern chỉ
// cần match theo path suffix, không phụ thuộc giá trị base URL thật.

export async function mockJson(page, urlPattern, body, { status = 200, method } = {}) {
  await page.route(urlPattern, async (route) => {
    if (method && route.request().method() !== method) {
      return route.fallback();
    }
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

// Envelope lỗi chuẩn của backend: luôn HTTP 400 kèm { code, message, detail }
// (xem UserGuide/API_Guide_For_Frontend.md mục 2.2).
export async function mockErrorEnvelope(page, urlPattern, { code = 'BadRequest', message = 'Đã có lỗi xảy ra.', detail = '' } = {}, opts = {}) {
  await mockJson(page, urlPattern, { code, message, detail }, { status: 400, ...opts });
}
