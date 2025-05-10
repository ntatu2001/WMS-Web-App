import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaChevronDown } from 'react-icons/fa'; // Import FaChevronDown icon
import styles from './UpdateAccount.module.scss'; // Import the CSS module
import UpdateAccountApi from '../../../../api/UpdateAccountApi';
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const UpdateAccount = ({ onCancel }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const [formData, setFormData] = useState({
    displayName: '',
    gender: '',
    day: '',
    month: '',
    year: '',
  });

  const [initialFormData, setInitialFormData] = useState(null); // Store initial form data
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  useEffect(() => {
    // Retrieve data from localStorage or Account.jsx
    const personName = localStorage.getItem('personName') || '';
    const gender = localStorage.getItem('Gender') || '';
    const dateOfBirth = localStorage.getItem('DateOfBirth') || ''; // Format: "DD-MM-YYYY"

    if (dateOfBirth) {
      const [day, month, year] = dateOfBirth.split('-');
      const initialData = {
        displayName: personName,
        gender,
        day,
        month,
        year,
      };
      setFormData(initialData);
      setInitialFormData(initialData); // Save initial data
    } else {
      const initialData = {
        displayName: personName,
        gender,
        day: '',
        month: '',
        year: '',
      };
      setFormData(initialData);
      setInitialFormData(initialData); // Save initial data
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'month' ? String(value).padStart(2, '0') : value, // Pad month with leading zero
    }));
  };

  const handleSubmit = async () => {
    const { displayName, gender, day, month, year } = formData;

    // Validation: Ensure no field is empty
    if (!displayName || !gender || !day || !month || !year) {
      alert('Vui lòng điền đầy đủ thông tin trước khi cập nhật.');
      return;
    }

    const personId = localStorage.getItem('userId'); // Retrieve personId from localStorage
    console.log('Retrieved personId:', personId); // Debug log to check personId
    if (!personId) {
      alert('Không tìm thấy thông tin người dùng.');
      return;
    }

    const params = {
      personId,
      personName: displayName,
      properties: [
        { propertyName: 'Gender', propertyValue: gender },
        { propertyName: 'DateOfBirth', propertyValue: `${day}-${month}-${year}` },
      ],
    };

    try {
      setIsSubmitting(true); // Start loading
      console.log('Submitting data:', params); // Debug log
      await UpdateAccountApi.updateAccountById(params); // Call API

      // Show success notification
      toast.success("Cập nhật thông tin thành công", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: "✔️", // Add checkmark icon
        style: {
          backgroundColor: "#333", // Dark background
          color: "#fff", // White text
          borderRadius: "8px", // Rounded corners
          padding: "16px", // Add padding
          textAlign: "center", // Center-align text
        },
      });

      navigate('/setting'); // Navigate back to the "Setting" sidebar
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Đã xảy ra lỗi khi cập nhật thông tin.');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  // Check if the form data has changed compared to the initial values
  const isFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
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
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
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
        <button
          className={styles.updateButton}
          onClick={handleSubmit}
          disabled={!isFormChanged() || isSubmitting} // Disable button if form hasn't changed or is submitting
          style={{
            backgroundColor: isFormChanged() && !isSubmitting ? "#007bff" : "#ccc", // Change button color
            cursor: isFormChanged() && !isSubmitting ? "pointer" : "not-allowed", // Change cursor style
          }}
        >
          {isSubmitting ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Đang cập nhật</span>
              <div className={styles.spinner}></div> {/* Add spinner */}
            </div>
          ) : (
            "Cập nhật"
          )}
        </button>
      </div>
    </div>
  );
};

export default UpdateAccount;