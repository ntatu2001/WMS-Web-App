import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRouteForRoles } from '../../common/config/menuConfig.js';

const Forbidden = () => {
  const navigate = useNavigate();
  const roles = useSelector((state) => state.auth.roles);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f44336', marginBottom: '10px' }}>403</h1>
      <p style={{ fontSize: '18px', color: '#555', marginBottom: '20px' }}>
        Bạn không có quyền truy cập chức năng này.
      </p>
      <button
        onClick={() => navigate(getDefaultRouteForRoles(roles))}
        style={{
          padding: '10px 20px',
          backgroundColor: '#002B49',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Về trang chủ
      </button>
    </div>
  );
};

export default Forbidden;
