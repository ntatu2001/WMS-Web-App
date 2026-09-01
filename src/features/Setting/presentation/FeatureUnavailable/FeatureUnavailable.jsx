import React from 'react';
import useTranslation from '../../../../common/hooks/useTranslation';

// Account.jsx/UpdateAccount.jsx tạm ngưng: sau khi có auth thật, đăng nhập không còn trả về
// employeeId nên 2 trang này mất nguồn dữ liệu (không có API "lấy thông tin tài khoản hiện tại"
// hay liên kết User<->Employee). Giữ route lại (không xoá) để tránh vỡ link cũ, chỉ đổi nội dung.
const FeatureUnavailable = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        width: '400px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        padding: '32px 20px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', margin: 0 }}>
        {t('account.featureUnavailable')}
      </p>
    </div>
  );
};

export default FeatureUnavailable;
