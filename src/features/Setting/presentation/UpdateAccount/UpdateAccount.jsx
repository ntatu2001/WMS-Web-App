import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaChevronDown } from 'react-icons/fa'; // Import FaChevronDown icon
import styles from './UpdateAccount.module.scss'; // Import the CSS module

const UpdateAccount = ({ onCancel }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    displayName: '',
    gender: '',
    day: '',
    month: '',
    year: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log('Submitted Data:', formData);
    alert('Thông tin đã được lưu!');
    navigate('/setting'); // Navigate back to the "Setting" sidebar
  };

  return (
    <div className={styles.updateAccountContainer}>
      <button
        onClick={onCancel} // Use onCancel to handle the "Hủy" button click
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
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
      <label htmlFor="displayName" className={styles.label}>Tên hiển thị:</label>
      <input
        type="text"
        id="displayName"
        name="displayName"
        placeholder="Nhập tên hiển thị"
        className={styles.inputField}
        value={formData.displayName}
        onChange={handleInputChange}
      />
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Thông tin cá nhân</p>
        <div className={styles.genderSelection}>
          <label>
            <input
              type="radio"
              name="gender"
              value="Nam"
              checked={formData.gender === 'Nam'}
              onChange={handleInputChange}
            /> Nam
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Nữ"
              checked={formData.gender === 'Nữ'}
              onChange={handleInputChange}
            /> Nữ
          </label>
        </div>
        <div className={styles.birthDate}>
          <p className={styles.sectionTitle}>Ngày sinh</p>
          <div className={styles.dateSelection}>
            <div className={styles.dropdownContainer}>
              <select
                id="day"
                name="day"
                className={styles.dropdown}
                value={formData.day}
                onChange={handleInputChange}
              >
                <option value="">Ngày</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <FaChevronDown className={styles.dropdownIcon} />
            </div>
            <div className={styles.dropdownContainer}>
              <select
                id="month"
                name="month"
                className={styles.dropdown}
                value={formData.month}
                onChange={handleInputChange}
              >
                <option value="">Tháng</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                ))}
              </select>
              <FaChevronDown className={styles.dropdownIcon} />
            </div>
            <div className={styles.dropdownContainer}>
              <select
                id="year"
                name="year"
                className={styles.dropdown}
                value={formData.year}
                onChange={handleInputChange}
              >
                <option value="">Năm</option>
                {[...Array(100)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
              <FaChevronDown className={styles.dropdownIcon} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={onCancel}>Hủy</button>
        <button className={styles.updateButton} onClick={handleSubmit}>Cập nhật</button>
      </div>
    </div>
  );
};

export default UpdateAccount;
