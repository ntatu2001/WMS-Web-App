import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import { createTestStore } from '../../test/test-utils';

vi.mock('../../api/authApi', () => ({
  default: { login: vi.fn() },
  decodeRoles: vi.fn(),
  decodeEmployeeId: vi.fn(),
}));

import authApi, { decodeRoles, decodeEmployeeId } from '../../api/authApi';

beforeEach(() => {
  authApi.login.mockReset();
  decodeRoles.mockReset();
  decodeEmployeeId.mockReset();
});

function renderLoginScreen() {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/dashboard" element={<div>Trang Dashboard</div>} />
          <Route path="/storage" element={<div>Trang Kho</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
}

async function submitLoginForm(user, { userName = 'alice', password = 'password123' } = {}) {
  await user.type(screen.getByPlaceholderText('Tên đăng nhập'), userName);
  await user.type(screen.getByPlaceholderText('Mật khẩu'), password);
  await user.click(screen.getByRole('button', { name: 'ĐĂNG NHẬP' }));
}

describe('LoginScreen', () => {
  it('đăng nhập thành công -> lưu state Redux và điều hướng theo role', async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    decodeRoles.mockReturnValue(['Admin']);
    decodeEmployeeId.mockReturnValue('EMP001');

    const store = renderLoginScreen();
    await submitLoginForm(user);

    await waitFor(() => expect(screen.getByText('Trang Dashboard')).toBeInTheDocument());
    expect(authApi.login).toHaveBeenCalledWith('alice', 'password123');
    expect(store.getState().auth).toMatchObject({
      isLogin: true,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      roles: ['Admin'],
    });
  });

  it('điều hướng đúng theo role Manager (không phải Admin)', async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    decodeRoles.mockReturnValue(['Manager']);
    decodeEmployeeId.mockReturnValue(null);

    renderLoginScreen();
    await submitLoginForm(user);

    await waitFor(() => expect(screen.getByText('Trang Kho')).toBeInTheDocument());
  });

  it('đăng nhập thất bại -> hiển thị lỗi từ response, không điều hướng', async () => {
    const user = userEvent.setup();
    authApi.login.mockRejectedValue({
      response: { data: { code: 'INVALID_CREDENTIALS', message: 'Tên đăng nhập hoặc mật khẩu không đúng' } },
    });

    renderLoginScreen();
    await submitLoginForm(user, { userName: 'alice', password: 'wrongpass' });

    expect(await screen.findByText('Tên đăng nhập hoặc mật khẩu không đúng')).toBeInTheDocument();
    expect(screen.queryByText('Trang Dashboard')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ĐĂNG NHẬP' })).toBeInTheDocument();
  });

  it('đăng nhập thất bại không có message cụ thể -> dùng fallback mặc định', async () => {
    const user = userEvent.setup();
    authApi.login.mockRejectedValue(new Error());

    renderLoginScreen();
    await submitLoginForm(user);

    expect(await screen.findByText('Tên đăng nhập hoặc mật khẩu không đúng')).toBeInTheDocument();
  });

  it('hiển thị trạng thái loading trong lúc chờ API và tắt nút bấm', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    authApi.login.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve; }));
    decodeRoles.mockReturnValue(['Admin']);
    decodeEmployeeId.mockReturnValue(null);

    renderLoginScreen();
    await submitLoginForm(user);

    const loadingButton = await screen.findByRole('button', { name: 'Đang đăng nhập...' });
    expect(loadingButton).toBeDisabled();

    resolveLogin({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    await waitFor(() => expect(screen.getByText('Trang Dashboard')).toBeInTheDocument());
  });
});
