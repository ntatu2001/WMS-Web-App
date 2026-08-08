import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AccountApi from '../../../../api/AccountApi.js';
import styles from './Account.module.scss';

// ⚠️ Backend đôi khi trả propertyName kèm khoảng trắng thừa (vd: "Gender "),
// nên so sánh sau khi trim thay vì so khớp tuyệt đối.
const findProperty = (properties, name) =>
  properties?.find((prop) => prop.propertyName?.trim() === name)?.propertyValue || '--';

const Account = ({ onCancel }) => {
  const userName = useSelector((state) => state.auth.userName);
  const roles = useSelector((state) => state.auth.roles);
  const employeeId = useSelector((state) => state.auth.employeeId);

  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      setEmployeeInfo(null);
      return;
    }
    setIsLoadingEmployee(true);
    AccountApi.GetAccountInfo(employeeId)
      .then((data) => setEmployeeInfo(data))
      .catch((error) => {
        console.error('Error fetching employee info:', error);
        setEmployeeInfo(null);
      })
      .finally(() => setIsLoadingEmployee(false));
  }, [employeeId]);

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Quản lý tài khoản</div>
          {onCancel && (
            <button className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
              ×
            </button>
          )}
        </div>

        <div className={styles.body}>
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

          {employeeId && (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Thông tin nhân viên</p>

              {isLoadingEmployee && <p className={styles.value}>Đang tải...</p>}

              {!isLoadingEmployee && employeeInfo && (
                <>
                  <label className={styles.label}>Họ tên</label>
                  <p className={styles.value}>{employeeInfo.employeeName || '--'}</p>

                  <label className={styles.label}>Mã nhân viên</label>
                  <p className={styles.value}>{employeeInfo.employeeId || '--'}</p>

                  <label className={styles.label}>Ngày sinh</label>
                  <p className={styles.value}>{findProperty(employeeInfo.employeePropertyDTOs, 'DateOfBirth')}</p>

                  <label className={styles.label}>Thời gian làm việc</label>
                  <p className={styles.value}>{findProperty(employeeInfo.employeePropertyDTOs, 'DailyWorkingTime')}</p>

                  <label className={styles.label}>Email</label>
                  <p className={styles.value}>{findProperty(employeeInfo.employeePropertyDTOs, 'Email')}</p>

                  <label className={styles.label}>Số điện thoại</label>
                  <p className={styles.value}>{findProperty(employeeInfo.employeePropertyDTOs, 'PhoneNumber')}</p>

                  <label className={styles.label}>Giới tính</label>
                  <p className={styles.value}>{findProperty(employeeInfo.employeePropertyDTOs, 'Gender')}</p>
                </>
              )}

              {!isLoadingEmployee && !employeeInfo && (
                <p className={styles.value}>Không tải được thông tin nhân viên.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
