import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import UserManagement from './UserManagement';
import { createTestStore } from '../../../../test/test-utils';

vi.mock('../../../../api/authApi.js', () => ({
  default: { createUser: vi.fn() },
}));
vi.mock('../../../../api/employeeApi.js', () => ({
  default: { getAllEmployees: vi.fn() },
}));
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import authApi from '../../../../api/authApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import { toast } from 'react-toastify';

beforeEach(() => {
  authApi.createUser.mockReset();
  employeeApi.getAllEmployees.mockReset().mockResolvedValue([]);
  toast.error.mockReset();
  toast.success.mockReset();
});

function renderUM(onCancel = vi.fn()) {
  const store = createTestStore();
  render(
    <Provider store={store}>
      <UserManagement onCancel={onCancel} />
    </Provider>
  );
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText('Tên đăng nhập'), 'newuser');
  await user.type(screen.getByLabelText('Email'), 'newuser@company.com');
  await user.type(screen.getByLabelText('Mật khẩu'), 'password123');
  await user.click(screen.getByText('Admin').closest('div'));
}

describe('UserManagement', () => {
  it('nạp danh sách nhân viên khi mount và hiển thị trong dropdown liên kết', async () => {
    employeeApi.getAllEmployees.mockResolvedValue([
      { employeeId: 'EMP001', employeeName: 'Nguyễn Văn A' },
    ]);

    renderUM();

    expect(await screen.findByText('Nguyễn Văn A (EMP001)')).toBeInTheDocument();
  });

  it('chấp nhận response dạng QueryResult { results, totalItems }', async () => {
    employeeApi.getAllEmployees.mockResolvedValue({
      results: [{ employeeId: 'EMP002', employeeName: 'Trần Thị B' }],
      totalItems: 1,
    });

    renderUM();

    expect(await screen.findByText('Trần Thị B (EMP002)')).toBeInTheDocument();
  });

  it('bỏ trống các trường bắt buộc -> báo lỗi validate, không gọi API tạo user', async () => {
    const user = userEvent.setup();
    renderUM();

    await user.click(screen.getByText('Tạo tài khoản'));

    expect(toast.error).toHaveBeenCalledWith('Vui lòng điền đầy đủ tên đăng nhập, email, mật khẩu và chọn 1 role.');
    expect(authApi.createUser).not.toHaveBeenCalled();
  });

  it('mật khẩu dưới 8 ký tự -> báo lỗi validate riêng', async () => {
    const user = userEvent.setup();
    renderUM();

    await user.type(screen.getByLabelText('Tên đăng nhập'), 'newuser');
    await user.type(screen.getByLabelText('Email'), 'newuser@company.com');
    await user.type(screen.getByLabelText('Mật khẩu'), '123');
    await user.click(screen.getByText('Admin').closest('div'));
    await user.click(screen.getByText('Tạo tài khoản'));

    expect(toast.error).toHaveBeenCalledWith('Mật khẩu phải có tối thiểu 8 ký tự.');
    expect(authApi.createUser).not.toHaveBeenCalled();
  });

  it('điền hợp lệ và submit thành công -> gọi createUser đúng payload, báo thành công, reset form', async () => {
    const user = userEvent.setup();
    authApi.createUser.mockResolvedValue({});

    renderUM();
    await fillValidForm(user);
    await user.click(screen.getByText('Tạo tài khoản'));

    await waitFor(() => expect(authApi.createUser).toHaveBeenCalledWith({
      userName: 'newuser',
      email: 'newuser@company.com',
      password: 'password123',
      roles: ['Admin'],
    }));
    expect(toast.success).toHaveBeenCalledWith('Tạo tài khoản thành công!');
    expect(screen.getByLabelText('Tên đăng nhập')).toHaveValue('');
  });

  it('submit thất bại với detail dạng mảng -> hiển thị các lỗi nối bằng dấu phẩy', async () => {
    const user = userEvent.setup();
    authApi.createUser.mockRejectedValue({
      response: { data: { detail: ['Username đã tồn tại', 'Email không hợp lệ'] } },
    });

    renderUM();
    await fillValidForm(user);
    await user.click(screen.getByText('Tạo tài khoản'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Username đã tồn tại, Email không hợp lệ'));
  });

  it('submit thất bại không có detail -> dùng message từ response hoặc fallback', async () => {
    const user = userEvent.setup();
    authApi.createUser.mockRejectedValue({ response: { data: { message: 'Username đã tồn tại' } } });

    renderUM();
    await fillValidForm(user);
    await user.click(screen.getByText('Tạo tài khoản'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Username đã tồn tại'));
  });

  it('bấm nút đóng thì gọi onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderUM(onCancel);

    await user.click(screen.getByRole('button', { name: 'Đóng' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
