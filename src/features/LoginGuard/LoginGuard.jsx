import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useEffect } from 'react';

const LoginGuard = () => {
  const isLogin = useSelector((state) => state.auth.isLogin);
  const dispatch = useDispatch();
  
  // Kiểm tra token trong localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedToken && storedUserName && !isLogin) {
      // Khôi phục trạng thái đăng nhập từ localStorage
      dispatch(login({ 
        user: { userName: storedUserName },
        token: storedToken
      }));
      console.log("LoginGuard: Restored login state from localStorage");
    }
  }, [isLogin, dispatch]);

  // Kiểm tra cả Redux state và localStorage
  const isAuthenticated = isLogin || localStorage.getItem('token');

  // Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép truy cập vào route
  return <Outlet />;
};

export default LoginGuard; 