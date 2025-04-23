import React from 'react';
import clsx from 'clsx';
import styles from './Account.module.scss';
import accountInfo from '../../../../app/mockData/AccountInfo.js';

const Account = ({ closeHandler }) => {
  return (
    <div className='AccountHide' style={{ width: '400px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff', position: 'relative' }}>
      <button
        onClick={closeHandler}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          cursor: 'pointer',
          fontSize: '30px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '16px', textAlign: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{accountInfo.fullName}</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Thông tin cá nhân:</h3>
        <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: '8px 0' }}><strong>Mã nhân viên:</strong> {accountInfo.employeeId}</p>
          <p style={{ margin: '8px 0' }}><strong>Ngày sinh:</strong> {accountInfo.dateOfBirth}</p>
          <p style={{ margin: '8px 0' }}><strong>Email:</strong> {accountInfo.email}</p>
          <p style={{ margin: '8px 0' }}><strong>Số điện thoại:</strong> {accountInfo.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default Account;

