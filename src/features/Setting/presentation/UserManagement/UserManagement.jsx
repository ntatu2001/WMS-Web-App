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
import useTranslation from '../../../../common/hooks/useTranslation';
import styles from './UserManagement.module.scss';

const ROLE_OPTIONS = [
  { id: 'Admin', label: 'Admin', descKey: 'account.umRoleAdminDesc', icon: AiOutlineStar },
  { id: 'Manager', label: 'Manager', descKey: 'account.umRoleManagerDesc', icon: AiOutlineUserSwitch },
  { id: 'Staff', label: 'Staff', descKey: 'account.umRoleStaffDesc', icon: AiOutlineUser },
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
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormData);
  const [employees, setEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeList = await employeeApi.getAllEmployees();
        // GetAllEmployees trả về QueryResult<EmployeeDTO> ({ results, totalItems }) sau đợt
        // migrate API — nhưng cũng chấp nhận mảng thẳng để phòng hờ.
        setEmployees(Array.isArray(employeeList) ? employeeList : (employeeList?.results || []));
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
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
      toast.error(t('account.umValRequired'));
      return;
    }
    if (formData.password.length < 8) {
      toast.error(t('account.umValPassword'));
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
      toast.success(t('account.umCreateOk'));
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error creating user:', error);
      const detail = error?.response?.data?.detail;
      const message = Array.isArray(detail) && detail.length > 0
        ? detail.join(', ')
        : getApiErrorMessage(error, t('account.umCreateFail'));
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onCancel}>
    <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <div className={styles.title}>{t('account.createTitle')}</div>
        {onCancel && (
          <button className={styles.closeButton} onClick={onCancel} aria-label={t('common.close')}>
            ×
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.banner}>
          <AiOutlineInfoCircle size={18} color="#1a6f7a" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            {t('account.umBanner')}
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <div className={styles.sectionTitle}>{t('account.umLoginInfo')}</div>

            <label className={styles.label} htmlFor="userName">{t('account.umUsername')}</label>
            <input
              id="userName"
              className={styles.inputField}
              type="text"
              name="userName"
              placeholder={t('account.umUsernamePh')}
              value={formData.userName}
              onChange={handleInputChange}
            />

            <label className={styles.label} htmlFor="email">{t('account.umEmail')}</label>
            <input
              id="email"
              className={styles.inputField}
              type="email"
              name="email"
              placeholder="email@company.com"
              value={formData.email}
              onChange={handleInputChange}
            />

            <label className={styles.label} htmlFor="password">{t('account.umPassword')}</label>
            <input
              id="password"
              className={styles.inputField}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('account.umPasswordPh')}
            />
          </div>

          <div>
            <div className={styles.sectionTitle}>{t('account.umAuthz')}</div>

            <label className={styles.label}>{t('account.umRole')}</label>
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
                      <div className={styles.roleDesc}>{t(role.descKey)}</div>
                    </div>
                    <div className={clsx(styles.roleDot, isSelected && styles.roleDotSelected)} />
                  </div>
                );
              })}
            </div>

            <label className={styles.label} htmlFor="employeeId">{t('account.umLinkEmployee')}</label>
            <div className={styles.dropdownContainer}>
              <select
                id="employeeId"
                className={styles.dropdown}
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
              >
                <option value="">{t('account.umNoLink')}</option>
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
            {t('account.umCancel')}
          </button>
        )}
        <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ClipLoader size={16} color="#fff" /> : t('account.umSubmit')}
        </button>
      </div>
    </div>
    </div>
  );
};

export default UserManagement;
