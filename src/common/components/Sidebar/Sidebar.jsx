import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MenuItem from '../MenuItem/MenuItem';
import clsx from 'clsx';
import styles from './Sidebar.module.scss';
import BKlogo from '../../../assets/bk_logo.png';
import { menuItems, isMenuItemVisible } from '../../config/menuConfig.js';

const Sidebar = () => {
  const location = useLocation();
  const [showSubSidebar, setShowSubSidebar] = useState(false);
  const roles = useSelector((state) => state.auth.roles);

  const isVisible = (item) => isMenuItemVisible(item, roles);

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
        {menuItems.filter(isVisible).map((item) => (
          <div key={item.id} className={clsx(styles.menuItemWrapper)}>
            <MenuItem
              to={item.path}
              active={location.pathname.startsWith(item.path) ? 1 : 0}
              onClick={() => item.isParent && setShowSubSidebar(!showSubSidebar)}
            >
              <span className={clsx(styles.sidebarIcon)}><item.icon /></span>
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
                    <span className={clsx(styles.sidebarIcon)}><subItem.icon /></span>
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
