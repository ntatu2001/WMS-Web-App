import React, { useState } from 'react';
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
  const handleCloseContent = () => {
    setShowAccountInfo(false);
    setShowUpdateAccount(false); // Close UpdateAccount when content is closed
    setActiveItem(null); // Reset active item when content is closed
    navigate('/setting'); // Navigate back to the "Setting" sidebar
  };

  return (
    <div>
      {showAccountInfo && (
        <div className={clsx(styles.accountInfoModal)}>
          <div className={clsx(styles.modalOverlay)} onClick={handleCloseContent} />
        </div>
      )}

      {showUpdateAccount && (
        <div className={clsx(styles.accountInfoModal)}>
          <div className={clsx(styles.modalOverlay)} onClick={handleCloseContent} />
        </div>
      )}
    </div>
  );
};

export default Setting;