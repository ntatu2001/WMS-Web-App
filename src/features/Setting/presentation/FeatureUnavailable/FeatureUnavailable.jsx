import React from 'react';

// Account.jsx/UpdateAccount.jsx tạm ngưng: sau khi có auth thật, đăng nhập không còn trả về
// employeeId nên 2 trang này mất nguồn dữ liệu (không có API "lấy thông tin tài khoản hiện tại"
// hay liên kết User<->Employee). Giữ route lại (không xoá) để tránh vỡ link cũ, chỉ đổi nội dung.
const FeatureUnavailable = () => {
  return (
    <div
      style={{
        width: '400px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        padding: '32px 20px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '16px', color: '#555', margin: 0 }}>
        Chức năng đang tạm ngưng, sẽ hỗ trợ trong bản cập nhật tới.
      </p>
    </div>
  );
};

export default FeatureUnavailable;
