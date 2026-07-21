import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { FaChevronDown } from 'react-icons/fa';
import SectionTitle from '../../../../common/components/Text/SectionTitle.jsx';
import authApi from '../../../../api/authApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import styles from './UserManagement.module.scss';

const ROLE_OPTIONS = ['Admin', 'Manager', 'Staff'];

const initialFormData = {
  userName: '',
  email: '',
  password: '',
  roles: [],
  employeeId: '',
};

// Auth/CreateUser là cách DUY NHẤT tạo tài khoản đăng nhập (không có API tự đăng ký).
// Guide không có API liệt kê user hiện có, nên trang này chỉ hỗ trợ tạo mới.
const UserManagement = ({ onCancel }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeList = await employeeApi.getAllEmployees();
        setEmployees(employeeList || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.userName || !formData.email || !formData.password || formData.roles.length === 0) {
      toast.error('Vui lòng điền đầy đủ tên đăng nhập, email, mật khẩu và chọn ít nhất 1 role.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    const payload = {
      userName: formData.userName,
      email: formData.email,
      password: formData.password,
      roles: formData.roles,
      ...(formData.employeeId ? { employeeId: formData.employeeId } : {}),
    };

    try {
      setIsSubmitting(true);
      await authApi.createUser(payload);
      toast.success('Tạo tài khoản thành công!');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating user:', error);
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail) && detail.length > 0
        ? detail.join(', ')
        : getApiErrorMessage(error, 'Tạo tài khoản thất bại. Vui lòng thử lại!');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {onCancel && (
        <button className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
          ×
        </button>
      )}

      <SectionTitle>Quản lý tài khoản</SectionTitle>
      <p className={styles.subtitle}>
        Chỉ Admin mới tạo được tài khoản mới. Hiện chưa có danh sách tài khoản đã tạo (backend chưa cung cấp API tương ứng).
      </p>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Thông tin đăng nhập</p>

        <label className={styles.label} htmlFor="userName">Tên đăng nhập</label>
        <input
          id="userName"
          className={styles.inputField}
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleInputChange}
        />

        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          className={styles.inputField}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />

        <label className={styles.label} htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          className={styles.inputField}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Tối thiểu 8 ký tự"
        />
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Phân quyền</p>

        <label className={styles.label}>Role</label>
        <div className={styles.roleChips}>
          {ROLE_OPTIONS.map((role) => (
            <label key={role} className={clsx(styles.roleChip, formData.roles.includes(role) && styles.roleChipActive)}>
              <input
                type="checkbox"
                className={styles.visuallyHidden}
                checked={formData.roles.includes(role)}
                onChange={() => handleRoleToggle(role)}
              />
              {role}
            </label>
          ))}
        </div>

        <label className={styles.label} htmlFor="employeeId" style={{ marginTop: '16px' }}>Liên kết nhân viên</label>
        <div className={styles.dropdownContainer}>
          <select
            id="employeeId"
            className={styles.dropdown}
            name="employeeId"
            value={formData.employeeId}
            onChange={handleInputChange}
          >
            <option value="">Không liên kết</option>
            {employees.map((employee) => (
              <option key={employee.employeeId} value={employee.employeeId}>
                {employee.employeeName} ({employee.employeeId})
              </option>
            ))}
          </select>
          <FaChevronDown className={styles.dropdownIcon} />
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button className={styles.cancelButton} onClick={onCancel}>
            Huỷ
          </button>
        )}
        <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ClipLoader size={16} color="#fff" /> : 'Tạo tài khoản'}
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
