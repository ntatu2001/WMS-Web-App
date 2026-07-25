import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { FaChevronDown } from 'react-icons/fa';
import { AiOutlineStar, AiOutlineUserSwitch, AiOutlineUser, AiOutlineInfoCircle } from 'react-icons/ai';
import authApi from '../../../../api/authApi.js';
import employeeApi from '../../../../api/employeeApi.js';
import { getApiErrorMessage } from '../../../../api/apiError.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import styles from './UserManagement.module.scss';

const ROLE_OPTIONS = [
  { id: 'Admin', label: 'Admin', desc: 'Toàn quyền hệ thống', icon: AiOutlineStar },
  { id: 'Manager', label: 'Manager', desc: 'Quản lý kho & nhân viên', icon: AiOutlineUserSwitch },
  { id: 'Staff', label: 'Staff', desc: 'Thao tác nhập/xuất kho', icon: AiOutlineUser },
];

const initialFormData = {
  userName: '',
  email: '',
  password: '',
  role: '',
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

  const handleSelectRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async () => {
    if (!formData.userName || !formData.email || !formData.password || !formData.role) {
      toast.error('Vui lòng điền đầy đủ tên đăng nhập, email, mật khẩu và chọn 1 role.');
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
      roles: [formData.role],
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
    <div className={styles.backdrop} onClick={onCancel}>
    <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <div className={styles.title}>Tạo tài khoản mới</div>
        {onCancel && (
          <button className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
            ×
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.banner}>
          <AiOutlineInfoCircle size={18} color="#1a6f7a" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            Chỉ Admin có quyền được tạo tài khoản mới trong ứng dụng WMS
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <div className={styles.sectionTitle}>Thông tin đăng nhập</div>

            <label className={styles.label} htmlFor="userName">Tên đăng nhập</label>
            <input
              id="userName"
              className={styles.inputField}
              type="text"
              name="userName"
              placeholder="vd: nguyenvana"
              value={formData.userName}
              onChange={handleInputChange}
            />

            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.inputField}
              type="email"
              name="email"
              placeholder="email@company.com"
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

          <div>
            <div className={styles.sectionTitle}>Phân quyền</div>

            <label className={styles.label}>Vai trò (Role)</label>
            <div className={styles.roleCards}>
              {ROLE_OPTIONS.map((role) => {
                const isSelected = formData.role === role.id;
                const RoleIcon = role.icon;
                return (
                  <div
                    key={role.id}
                    className={clsx(styles.roleCard, isSelected && styles.roleCardSelected)}
                    onClick={() => handleSelectRole(role.id)}
                  >
                    <div className={clsx(styles.roleIconTile, isSelected && styles.roleIconTileSelected)}>
                      <RoleIcon size={19} />
                    </div>
                    <div className={styles.roleText}>
                      <div className={styles.roleLabel}>{role.label}</div>
                      <div className={styles.roleDesc}>{role.desc}</div>
                    </div>
                    <div className={clsx(styles.roleDot, isSelected && styles.roleDotSelected)} />
                  </div>
                );
              })}
            </div>

            <label className={styles.label} htmlFor="employeeId">Liên kết nhân viên</label>
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
        </div>
      </div>

      <div className={styles.footer}>
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
    </div>
  );
};

export default UserManagement;
