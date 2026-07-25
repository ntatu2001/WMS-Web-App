import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../../store/slices/authSlice';
import authApi from '../../../../api/authApi';

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.auth.refreshToken);

  const handleLogout = async () => {
    if (refreshToken) {
      // Thu hồi refresh token ở backend — best-effort, không chặn logout ở FE nếu lỗi
      await authApi.logout(refreshToken).catch((error) => {
        console.error('Error calling Auth/Logout:', error);
      });
    }
    dispatch(logout());
    localStorage.clear();
    sessionStorage.clear();
    console.log("User logged out");
    navigate('/login'); // Navigate back to LoginScreen
    window.location.reload(); // Refresh the page
  };

  return (
    <div
      style={{
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1
        style={{
          fontWeight: 'bold',
          fontSize: '24px',
          color: '#333',
          marginBottom: '10px',
        }}
      >
        Đăng xuất
      </h1>
      <p style={{ marginBottom: '20px', color: '#555' }}>
        Bạn có chắc chắn muốn đăng xuất không?
      </p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s, transform 0.2s',
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#d32f2f';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#f44336';
          e.target.style.transform = 'scale(1)';
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Logout;
