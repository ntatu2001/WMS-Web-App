import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MenuItem from '../MenuItem/MenuItem';
import clsx from 'clsx';
import styles from './Sidebar.module.scss';
import BKlogo from '../../../assets/bk_logo.png';
import {
  AiOutlineSetting,
  AiOutlineHome,
  AiOutlineDatabase,
  AiOutlineImport,
  AiOutlineExport,
  AiOutlineCheckSquare,
  AiOutlineHistory,
  AiOutlineUnorderedList,
  AiOutlineTeam,
  AiOutlineClose,
} from 'react-icons/ai';

const Sidebar = () => {
  const location = useLocation();
  const [showSubSidebar, setShowSubSidebar] = useState(false);
  const roles = useSelector((state) => state.auth.roles);

  const menuItems = [
    { id: 1, title: 'Tổng quan', icon: <AiOutlineHome />, path: '/dashboard' },
    { id: 2, title: 'Lưu trữ', icon: <AiOutlineDatabase />, path: '/storage' },
    { id: 3, title: 'Nhập kho', icon: <AiOutlineImport />, path: '/goodreceipt' },
    { id: 4, title: 'Xuất kho', icon: <AiOutlineExport />, path: '/goodissue' },
    { id: 5, title: 'Kiểm kê', icon: <AiOutlineCheckSquare />, path: '/inventory' },
    { id: 6, title: 'Lịch sử', icon: <AiOutlineHistory />, path: '/history' },
    { id: 7, title: 'Danh mục', icon: <AiOutlineUnorderedList />, path: '/catalogue' },
    {
      id: 8,
      title: 'Cài đặt',
      icon: <AiOutlineSetting />,
      path: '/setting',
      isParent: true,
      subItems: [
        // Tài khoản/Cập nhật tạm ẩn vì đăng nhập bằng JWT không còn trả về employeeId để tra cứu Employee
        { id: 8.1, title: 'Quản lý tài khoản', icon: <AiOutlineTeam />, path: '/setting/users', roles: ['Admin'] },
        { id: 8.2, title: 'Đăng xuất', icon: <AiOutlineClose />, path: '/setting/logout' },
      ],
    },
  ];

  const isVisible = (item) => !item.roles || item.roles.some((role) => roles.includes(role));

  return (
    <div className={clsx(styles.sidebar)}>
      {/* Logo and Title */}
      <div className={clsx(styles.sidebarHeader)}>
        <div className={clsx(styles.sidebarLogo)}>
          <img src={BKlogo} alt="BK Logo" className={clsx(styles.sidebarImg)} />
        </div>
        <h1 className={clsx(styles.sidebarTitle)}>WMS Portal</h1>
      </div>

      {/* Menu Items */}
      <nav className={clsx(styles.sidebarNav)}>
        {menuItems.map((item) => (
          <div key={item.id} className={clsx(styles.menuItemWrapper)}>
            <MenuItem
              to={item.path}
              active={location.pathname.startsWith(item.path) ? 1 : 0}
              onClick={() => item.isParent && setShowSubSidebar(!showSubSidebar)}
            >
              <span className={clsx(styles.sidebarIcon)}>{item.icon}</span>
              <span>{item.title}</span>
            </MenuItem>
            {item.isParent && showSubSidebar && (
              <div className={clsx(styles.subSidebar)}>
                {item.subItems.filter(isVisible).map((subItem) => (
                  <MenuItem
                    key={subItem.id}
                    to={subItem.path}
                    active={location.pathname === subItem.path ? 1 : 0}
                  >
                    <span className={clsx(styles.sidebarIcon)}>{subItem.icon}</span>
                    <span>{subItem.title}</span>
                  </MenuItem>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
