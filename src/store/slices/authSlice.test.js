import { describe, it, expect, vi } from 'vitest';
import authReducer, { loginSuccess, tokensRefreshed, bootstrapFailed, logout } from './authSlice';

const baseState = {
  isLogin: false,
  accessToken: null,
  refreshToken: null,
  roles: [],
  userName: null,
  employeeId: null,
  isBootstrapping: false,
};

describe('authSlice reducers', () => {
  it('loginSuccess: set state đăng nhập và ghi refreshToken/userName vào localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const next = authReducer(baseState, loginSuccess({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      roles: ['Admin'],
      userName: 'alice',
      employeeId: 'EMP001',
    }));

    expect(next).toMatchObject({
      isLogin: true,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      roles: ['Admin'],
      userName: 'alice',
      employeeId: 'EMP001',
      isBootstrapping: false,
    });
    expect(setItemSpy).toHaveBeenCalledWith('refreshToken', 'refresh-1');
    expect(setItemSpy).toHaveBeenCalledWith('userName', 'alice');
  });

  it('loginSuccess: roles/employeeId thiếu thì mặc định []/null', () => {
    const next = authReducer(baseState, loginSuccess({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      userName: 'alice',
    }));

    expect(next.roles).toEqual([]);
    expect(next.employeeId).toBeNull();
  });

  it('tokensRefreshed: cập nhật token và giữ nguyên roles/employeeId cũ nếu payload không truyền lại', () => {
    const loggedInState = {
      ...baseState,
      isLogin: true,
      roles: ['Manager'],
      employeeId: 'EMP002',
      isBootstrapping: true,
    };

    const next = authReducer(loggedInState, tokensRefreshed({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    }));

    expect(next.accessToken).toBe('access-2');
    expect(next.refreshToken).toBe('refresh-2');
    expect(next.roles).toEqual(['Manager']); // giữ nguyên, không bị ghi đè thành []
    expect(next.employeeId).toBe('EMP002');   // giữ nguyên
    expect(next.isBootstrapping).toBe(false);
  });

  it('tokensRefreshed: có truyền roles/employeeId mới thì ghi đè', () => {
    const loggedInState = { ...baseState, roles: ['Manager'], employeeId: 'EMP002' };

    const next = authReducer(loggedInState, tokensRefreshed({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
      roles: ['Admin'],
      employeeId: 'EMP999',
    }));

    expect(next.roles).toEqual(['Admin']);
    expect(next.employeeId).toBe('EMP999');
  });

  it('bootstrapFailed: chỉ tắt isBootstrapping, không đổi các field khác', () => {
    const state = { ...baseState, isBootstrapping: true, roles: ['Admin'] };
    const next = authReducer(state, bootstrapFailed());

    expect(next.isBootstrapping).toBe(false);
    expect(next.roles).toEqual(['Admin']); // không bị reset
  });

  it('logout: xoá sạch state và localStorage', () => {
    localStorage.setItem('refreshToken', 'refresh-1');
    localStorage.setItem('userName', 'alice');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const loggedInState = {
      isLogin: true,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      roles: ['Admin'],
      userName: 'alice',
      employeeId: 'EMP001',
      isBootstrapping: false,
    };
    const next = authReducer(loggedInState, logout());

    expect(next).toEqual(baseState);
    expect(removeItemSpy).toHaveBeenCalledWith('refreshToken');
    expect(removeItemSpy).toHaveBeenCalledWith('userName');
  });
});

describe('authSlice initial state (đọc từ localStorage lúc import module)', () => {
  // authSlice.js đọc localStorage.getItem('refreshToken'/'userName') ngay tại thời điểm
  // import module (top-level), nên phải seed localStorage TRƯỚC rồi import động với
  // vi.resetModules() — import tĩnh ở đầu file sẽ dùng cache module cũ và bỏ lỡ giá trị mới.
  it('có refreshToken cũ trong localStorage -> isBootstrapping = true', async () => {
    vi.resetModules();
    localStorage.setItem('refreshToken', 'old-refresh-token');
    localStorage.setItem('userName', 'bob');

    const { default: freshAuthReducer } = await import('./authSlice');
    const state = freshAuthReducer(undefined, { type: '@@INIT' });

    expect(state.isBootstrapping).toBe(true);
    expect(state.refreshToken).toBe('old-refresh-token');
    expect(state.userName).toBe('bob');
  });

  it('không có refreshToken trong localStorage -> isBootstrapping = false', async () => {
    vi.resetModules();
    localStorage.clear();

    const { default: freshAuthReducer } = await import('./authSlice');
    const state = freshAuthReducer(undefined, { type: '@@INIT' });

    expect(state.isBootstrapping).toBe(false);
    expect(state.refreshToken).toBeNull();
    expect(state.userName).toBeNull();
  });
});
