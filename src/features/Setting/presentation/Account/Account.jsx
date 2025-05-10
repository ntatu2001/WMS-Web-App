import React, { useEffect, useState } from 'react';
import AccountApi from '../../../../api/AccountApi';

const Account = ({ closeHandler }) => {
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const userName = localStorage.getItem('userName'); // Retrieve userName from localStorage
        if (userName) {
          const response = await AccountApi.GetAccountInfo(userName); // Call API with userName
          localStorage.setItem('userId', response.personId); // Store personId in localStorage

          const formattedResponse = {
            ...response,
            DateOfBirth: response.personPropertyDTOs.find((prop) => prop.propertyName === 'DateOfBirth')?.propertyValue || '--',
            Email: response.personPropertyDTOs.find((prop) => prop.propertyName === 'Email')?.propertyValue || '--',
            PhoneNumber: response.personPropertyDTOs.find((prop) => prop.propertyName === 'PhoneNumber')?.propertyValue || '--',
            Gender: response.personPropertyDTOs.find((prop) => prop.propertyName === 'Gender')?.propertyValue || '--',
          };

          // Save personName, Gender, and DateOfBirth to localStorage
          localStorage.setItem('personName', response.personName || '');
          localStorage.setItem('Gender', formattedResponse.Gender || '');
          localStorage.setItem('DateOfBirth', formattedResponse.DateOfBirth || '');

          setAccountInfo(formattedResponse);
        } else {
          console.error('No userName found in localStorage');
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
      }
    };

    fetchAccountInfo();
  }, []);

  if (!accountInfo) {
    return <div>Loading...</div>;
  }

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
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{accountInfo.personName}</h2>
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Thông tin cá nhân:</h3>
        <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: '8px 0' }}><strong>Mã nhân viên:</strong> {accountInfo.personId}</p>
          <p style={{ margin: '8px 0' }}><strong>Ngày sinh:</strong> {accountInfo.DateOfBirth}</p>
          <p style={{ margin: '8px 0' }}><strong>Email:</strong> {accountInfo.Email}</p>
          <p style={{ margin: '8px 0' }}><strong>Số điện thoại:</strong> {accountInfo.PhoneNumber}</p>
          <p style={{ margin: '8px 0' }}><strong>Giới tính:</strong> {accountInfo.Gender}</p>
        </div>
      </div>
    </div>
  );
};

export default Account;

