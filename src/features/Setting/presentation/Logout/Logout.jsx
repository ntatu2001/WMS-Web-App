<<<<<<< HEAD
import React from 'react';
import { useNavigate } from 'react-router-dom';
=======
import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import Table from '../../../../common/components/Table/Table.jsx';
import TableHeader from '../../../../common/components/Table/TableHeader.jsx';
import TableCell from '../../../../common/components/Table/TableCell.jsx';
import FormGroup from '../../../../common/components/FormGroup/FormGroup.jsx';
import SelectContainer from '../../../../common/components/Selection/SelectContainer.jsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import DateInput from '../../../../common/components/DateInput/DateInput.jsx';
import Label from '../../../../common/components/Label/Label.jsx';
import FormSection from '../../../../common/components/Section/FormSection.jsx';
import ListSection from '../../../../common/components/Section/ListSection.jsx';
import DeleteButton from '../../../../common/components/Button/DeleteButton/DeleteButton.jsx';
import SearchInput from '../../../../common/components/Input/SearchInput.jsx';
import LabelSmallSize from '../../../../common/components/Label/LabelSmallSize.jsx';
import clsx from 'clsx';
import styles from './Logout.module.scss';
>>>>>>> c39329097598eaaaf4cea085e0f33b089de91575

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("User logged out");
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Đăng xuất</h1>
      <p>Bạn có chắc chắn muốn đăng xuất không?</p>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Logout;
