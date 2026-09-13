import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireRole from './RequireRole';
import { createTestStore } from '../../test/test-utils';

function renderProtectedRoute(preloadedState, allowedRoles = ['Admin']) {
  const store = createTestStore(preloadedState);
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <RequireRole roles={allowedRoles}>
                <div>Nội dung Dashboard</div>
              </RequireRole>
            }
          />
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
          <Route path="/403" element={<div>Trang 403</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('RequireRole', () => {
  it('chuyển hướng về /login khi chưa đăng nhập', () => {
    renderProtectedRoute({ auth: { isLogin: false, roles: [] } });

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung Dashboard')).not.toBeInTheDocument();
  });

  it('chuyển hướng về /403 khi đăng nhập nhưng sai role', () => {
    renderProtectedRoute({ auth: { isLogin: true, roles: ['Manager'] } });

    expect(screen.getByText('Trang 403')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung Dashboard')).not.toBeInTheDocument();
  });

  it('render children khi đăng nhập và role khớp', () => {
    renderProtectedRoute({ auth: { isLogin: true, roles: ['Admin'] } });

    expect(screen.getByText('Nội dung Dashboard')).toBeInTheDocument();
  });

  it('render children khi role khớp 1 trong nhiều role được phép', () => {
    renderProtectedRoute({ auth: { isLogin: true, roles: ['Manager'] } }, ['Manager', 'Admin']);

    expect(screen.getByText('Nội dung Dashboard')).toBeInTheDocument();
  });
});
