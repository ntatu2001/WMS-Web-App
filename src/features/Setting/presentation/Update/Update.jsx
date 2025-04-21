import React from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import UpdateAccount from '../UpdateAccount.js';

const Update = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '400px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
        <SectionTitle title="Update Information" />
        <div>
          <p><strong>Họ và tên:</strong> {UpdateAccount.fullName}</p>
          <p><strong>Mã nhân viên:</strong> {UpdateAccount.employeeId}</p>
          <p><strong>Ngày sinh:</strong> {UpdateAccount.dateOfBirth}</p>
          <p><strong>Email:</strong> {UpdateAccount.email}</p>
          <p><strong>Số điện thoại:</strong> {UpdateAccount.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default Update;

