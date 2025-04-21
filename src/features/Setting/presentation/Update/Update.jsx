import React from 'react';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
<<<<<<< HEAD
import UpdateAccount from '../UpdateAccount.js';
=======
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
import styles from './Update.module.scss';
>>>>>>> c39329097598eaaaf4cea085e0f33b089de91575

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

