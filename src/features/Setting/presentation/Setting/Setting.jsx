import React, { useState } from 'react';
import { AiOutlineUser, AiOutlineEdit, AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import styles from './Setting.module.scss';
import accountInfo from '../../../../app/mockData/AccountInfo.js'; // Import for account information
import UpdateAccount from '../UpdateAccount/UpdateAccount'; // Corrected import path

const Setting = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(null); // Track the active item
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showUpdateAccount, setShowUpdateAccount] = useState(false); // State for UpdateAccount visibility

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("User logged out");
    window.location.href = 'http://localhost:5173/login';
  };

  const handleCloseContent = () => {
    setShowAccountInfo(false);
    setShowUpdateAccount(false); // Close UpdateAccount when content is closed
    setActiveItem(null); // Reset active item when content is closed
    navigate('/setting'); // Navigate back to the "Setting" sidebar
  };

  return (
    <div className={clsx(styles.settingContainer)} style={{ marginTop: '28.4%' }}>
      <div className={clsx(styles.dropdownMenu)}>
        <div
          className={clsx(styles.dropdownItem, { [styles.active]: activeItem === 'account' })}
          onClick={() => {
            setActiveItem('account');
            setShowAccountInfo(true);
            setShowUpdateAccount(false); // Ensure UpdateAccount is hidden
          }}
        >
          <AiOutlineUser className={clsx(styles.icon)} />
          <span className={clsx(styles.text)}>Tài khoản</span>
        </div>
        <div
          className={clsx(styles.dropdownItem, { [styles.active]: activeItem === 'update' })}
          onClick={() => {
            setActiveItem('update');
            setShowUpdateAccount(true);
            setShowAccountInfo(false); // Ensure AccountInfo is hidden
          }}
        >
          <AiOutlineEdit className={clsx(styles.icon)} />
          <span className={clsx(styles.text)}>Cập nhật</span>
        </div>
        <div className={clsx(styles.dropdownItem, styles.logout)} onClick={handleLogout}>
          <AiOutlineClose className={clsx(styles.icon)} />
          <span className={clsx(styles.text)}>Đăng xuất</span>
        </div>
      </div>

      {showAccountInfo && (
        <div className={clsx(styles.accountInfoModal)}>
          <div className={clsx(styles.modalOverlay)} onClick={handleCloseContent} />
          <div className={clsx(styles.modalContent)}>
            <div className={clsx(styles.modalHeader)}>
              <div className={clsx(styles.centerText)}>Thông tin tài khoản</div>
              <AiOutlineClose
                className={clsx(styles.closeIcon)}
                onClick={handleCloseContent} // Navigate back to "Setting" sidebar
              />
            </div>
            <div className={clsx(styles.modalBody)}>
              <div className={clsx(styles.accountName)}>{accountInfo.fullName}</div>
              <div className={clsx(styles.accountDetails)} style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: '0px 20px 20px 20px', borderRadius: '0' }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", marginLeft: '-18px' }}>Thông tin cá nhân:</p>
                <div className='Info' style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', textAlign: 'left' }}>
                  <p><strong>Mã nhân viên:</strong> {accountInfo.employeeId}</p>
                  <p><strong>Ngày sinh:</strong> {accountInfo.dateOfBirth}</p>
                  <p><strong>Email:</strong> {accountInfo.email}</p>
                  <p><strong>Số điện thoại:</strong> {accountInfo.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpdateAccount && (
        <div className={clsx(styles.accountInfoModal)}>
          <div className={clsx(styles.modalOverlay)} onClick={handleCloseContent} />
          <div className={clsx(styles.modalContent)}>
            <div className={clsx(styles.modalHeader)}>
              <div className={clsx(styles.centerText)}>Cập nhật thông tin cá nhân</div>
              <AiOutlineClose
                className={clsx(styles.closeIcon)}
                onClick={handleCloseContent} // Navigate back to "Setting" sidebar
              />
            </div>
            <div className={clsx(styles.modalBody)}>
              <UpdateAccount onCancel={handleCloseContent} /> {/* Pass handleCloseContent to UpdateAccount */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;