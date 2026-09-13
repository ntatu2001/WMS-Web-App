// Fixture đăng nhập dùng chung cho mọi E2E spec cần một phiên đã đăng nhập.
// FE decode role/employeeId trực tiếp từ payload JWT (atob, không verify chữ ký —
// xem src/api/authApi.js), nên JWT giả ở đây không cần signature thật.

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

export function buildFakeJwt({ roles = [], employeeId = null } = {}) {
  const header = base64url({ alg: 'none', typ: 'JWT' });
  const payload = base64url({
    [ROLE_CLAIM]: roles,
    employeeId,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${header}.${payload}.fake-signature`;
}

function tokenPairBody({ roles, employeeId, refreshToken }) {
  return {
    accessToken: buildFakeJwt({ roles, employeeId }),
    refreshToken,
    accessTokenExpiresAtUtc: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

// Mock Auth/Refresh — dùng cho luồng "F5 lại trang khi đã đăng nhập" (LoginGuard tự
// gọi refresh ngầm) và cho kịch bản "401 giữa chừng -> tự refresh -> retry".
export async function mockAuthRefresh(page, { roles = ['Admin'], employeeId = null, refreshToken = 'mock-refresh-token' } = {}) {
  await page.route('**/Auth/Refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tokenPairBody({ roles, employeeId, refreshToken })),
    });
  });
}

export async function mockAuthRefreshFailure(page) {
  await page.route('**/Auth/Refresh', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'InvalidRefreshToken',
        message: 'The refresh token is invalid, expired or revoked.',
        detail: '',
      }),
    });
  });
}

export async function mockAuthLoginSuccess(page, { roles = ['Admin'], employeeId = null, refreshToken = 'mock-refresh-token' } = {}) {
  await page.route('**/Auth/Login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tokenPairBody({ roles, employeeId, refreshToken })),
    });
  });
}

export async function mockAuthLoginFailure(page, { code = 'InvalidCredentials', message = 'The username or password is incorrect.' } = {}) {
  await page.route('**/Auth/Login', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ code, message, detail: '' }),
    });
  });
}

// Mô phỏng "đã đăng nhập từ trước, F5 lại trang": seed refreshToken/userName vào
// localStorage rồi điều hướng — accessToken KHÔNG được set thẳng vì thực tế app cũng
// không lưu accessToken (chỉ sống trong Redux memory, mất khi F5 — xem authSlice.js).
// LoginGuard sẽ tự chạy nốt luồng refresh ngầm khi phát hiện có refreshToken cũ.
export async function loginAs(page, { roles = ['Admin'], employeeId = null, userName = 'demo.user', targetPath = '/' } = {}) {
  await mockAuthRefresh(page, { roles, employeeId });
  await page.goto('/login');
  await page.evaluate((un) => {
    localStorage.setItem('refreshToken', 'seed-refresh-token');
    localStorage.setItem('userName', un);
  }, userName);
  await page.goto(targetPath);
}
