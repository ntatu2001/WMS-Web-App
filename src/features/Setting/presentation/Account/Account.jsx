import React from 'react';
import { useSelector } from 'react-redux';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import styles from './Account.module.scss';

const Account = ({ onCancel }) => {
  const userName = useSelector((state) => state.auth.userName);
  const roles = useSelector((state) => state.auth.roles);

  return (
    <div className={styles.container}>
      {onCancel && (
        <button className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
          ×
        </button>
      )}

      <SectionTitle>Quản lý tài khoản</SectionTitle>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Thông tin tài khoản</p>

        <label className={styles.label}>Tên đăng nhập</label>
        <p className={styles.value}>{userName || '--'}</p>

        <label className={styles.label}>Vai trò</label>
        <div className={styles.roleChips}>
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <span key={role} className={styles.roleChip}>
                {role}
              </span>
            ))
          ) : (
            <p className={styles.value}>--</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
