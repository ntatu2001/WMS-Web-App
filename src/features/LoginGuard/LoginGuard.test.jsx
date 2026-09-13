import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginGuard from './LoginGuard';
import { createTestStore } from '../../test/test-utils';

// LoginGuard import authApi trực tiếp (không qua axiosClient) nên mock cả module này.
vi.mock('../../api/authApi', () => ({
  default: { refresh: vi.fn() },
  decodeRoles: vi.fn(),
  decodeEmployeeId: vi.fn(),
}));

import authApi, { decodeRoles, decodeEmployeeId } from '../../api/authApi';

beforeEach(() => {
  authApi.refresh.mockReset();
  decodeRoles.mockReset();
  decodeEmployeeId.mockReset();
});

function renderGuardedRoute(preloadedState) {
  const store = createTestStore(preloadedState);
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<LoginGuard />}>
            <Route path="/dashboard" element={<div>Nội dung được bảo vệ</div>} />
          </Route>
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
}

describe('LoginGuard', () => {
  it('đã đăng nhập -> render Outlet ngay, không gọi authApi.refresh', () => {
    renderGuardedRoute({
      auth: { isLogin: true, accessToken: 'token', refreshToken: 'refresh', isBootstrapping: false, roles: ['Admin'] },
    });

    expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument();
    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it('chưa đăng nhập và không có refreshToken -> chuyển hướng /login', () => {
    renderGuardedRoute({
      auth: { isLogin: false, accessToken: null, refreshToken: null, isBootstrapping: false, roles: [] },
    });

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument();
    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it('đang bootstrapping (F5 với refreshToken cũ) -> không render gì, gọi refresh, thành công thì vào được trang', async () => {
    authApi.refresh.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    decodeRoles.mockReturnValue(['Admin']);
    decodeEmployeeId.mockReturnValue('EMP001');

    const store = renderGuardedRoute({
      auth: { isLogin: false, accessToken: null, refreshToken: 'old-refresh', isBootstrapping: true, roles: [] },
    });

    // Trong lúc đang refresh: chưa thấy nội dung bảo vệ, cũng chưa bị đá về /login.
    expect(screen.queryByText('Nội dung được bảo vệ')).not.toBeInTheDocument();
    expect(screen.queryByText('Trang đăng nhập')).not.toBeInTheDocument();

    await waitFor(() => expect(authApi.refresh).toHaveBeenCalledWith('old-refresh'));
    await waitFor(() => expect(screen.getByText('Nội dung được bảo vệ')).toBeInTheDocument());

    expect(store.getState().auth).toMatchObject({
      isLogin: true,
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      roles: ['Admin'],
      employeeId: 'EMP001',
      isBootstrapping: false,
    });
  });

  it('đang bootstrapping nhưng refresh thất bại -> dispatch bootstrapFailed rồi chuyển hướng /login', async () => {
    authApi.refresh.mockRejectedValue(new Error('refresh token expired'));

    renderGuardedRoute({
      auth: { isLogin: false, accessToken: null, refreshToken: 'old-refresh', isBootstrapping: true, roles: [] },
    });

    await waitFor(() => expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument());
  });
});
