import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { tokensRefreshed, bootstrapFailed } from '../../store/slices/authSlice';
import { setLoading } from '../../store/slices/appSlice';
import authApi, { decodeRoles, decodeEmployeeId } from '../../api/authApi';

const LoginGuard = () => {
  const isLogin = useSelector((state) => state.auth.isLogin);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const isBootstrapping = useSelector((state) => state.auth.isBootstrapping);
  const dispatch = useDispatch();

  // Sau khi F5, Redux mất accessToken (chỉ refreshToken còn trong localStorage) — thử refresh ngầm 1 lần
  // trước khi quyết định điều hướng /login, để tránh bị đá ra ngoài dù phiên đăng nhập vẫn còn hiệu lực.
  useEffect(() => {
    if (!accessToken && refreshToken && isBootstrapping) {
      dispatch(setLoading(true));
      authApi.refresh(refreshToken)
        .then((data) => {
          dispatch(tokensRefreshed({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            roles: decodeRoles(data.accessToken),
            employeeId: decodeEmployeeId(data.accessToken),
          }));
        })
        .catch(() => {
          dispatch(bootstrapFailed());
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  }, [accessToken, refreshToken, isBootstrapping, dispatch]);

  if (isBootstrapping) {
    return null;
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default LoginGuard; 