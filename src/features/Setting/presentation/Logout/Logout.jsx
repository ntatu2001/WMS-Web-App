import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("User logged out");
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Đăng xuất</h1>
      <p>Bạn có chắc chắn muốn đăng xuất không?</p>
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
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Logout;
