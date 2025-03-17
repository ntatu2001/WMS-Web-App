import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LoginGuard = () => {
  const isLogin = useSelector((state) => state.auth.isLogin);

  // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập vào route
  return <Outlet />;
};

export default LoginGuard; 