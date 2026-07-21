import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RequireRole = ({ role, children }) => {
  const isLogin = useSelector((state) => state.auth.isLogin);
  const roles = useSelector((state) => state.auth.roles);

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RequireRole;
