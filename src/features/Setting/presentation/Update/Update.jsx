import React from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import UpdateAccount from '../UpdateAccount/UpdateAccount'; // Corrected import path

const Update = () => {
  const accountInfo = {
    fullName: "Nguyen Van A",
    employeeId: "EMP123",
    dateOfBirth: "01/01/1990",
    email: "nguyenvana@example.com",
    phoneNumber: "0123456789",
  }; // Mock data for demonstration

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '400px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
        <SectionTitle title="Update Information" />
        <div>
          <p><strong>Họ và tên:</strong> {accountInfo.fullName}</p>
          <p><strong>Mã nhân viên:</strong> {accountInfo.employeeId}</p>
          <p><strong>Ngày sinh:</strong> {accountInfo.dateOfBirth}</p>
          <p><strong>Email:</strong> {accountInfo.email}</p>
          <p><strong>Số điện thoại:</strong> {accountInfo.phoneNumber}</p>
        </div>
      </div>
    </div>
  );
};

export default Update;

