import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AiOutlineRight, AiOutlineLeft } from 'react-icons/ai';
import MenuItem from '../MenuItem/MenuItem';
import clsx from 'clsx';
import styles from './Sidebar.module.scss';
import BKlogo from '../../../assets/bk_logo.png';
import { menuItems, isMenuItemVisible } from '../../config/menuConfig.js';

const Sidebar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const roles = useSelector((state) => state.auth.roles);
  const settingsRef = useRef(null);

  const isVisible = (item) => isMenuItemVisible(item, roles);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  const visibleItems = menuItems.filter(isVisible);
  const navItems = visibleItems.filter((item) => !item.isParent);
  const settingsItem = visibleItems.find((item) => item.isParent);

  return (
    <div className={clsx(styles.sidebar, collapsed && styles.sidebarCollapsed)}>
      <button
        type="button"
        className={clsx(styles.collapseToggle)}
        onClick={handleToggleCollapse}
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        aria-expanded={!collapsed}
      >
        <AiOutlineLeft className={clsx(styles.collapseIcon, collapsed && styles.collapseIconRotated)} />
      </button>

      {/* Logo and Title */}
      <div className={clsx(styles.sidebarHeader)}>
        <div className={clsx(styles.sidebarLogo)}>
          <img src={BKlogo} alt="BK Logo" className={clsx(styles.sidebarImg)} />
        </div>
        <h1 className={clsx(styles.sidebarTitle)}>WMS Portal</h1>
      </div>

      {/* Menu Items */}
      <nav className={clsx(styles.sidebarNav)}>
        <div className={clsx(styles.sidebarNavScroll)}>
          {navItems.map((item) => (
            <MenuItem key={item.id} to={item.path} collapsed={collapsed} tooltip={item.title}>
              <span className={clsx(styles.sidebarIcon)}><item.icon /></span>
              <span>{item.title}</span>
            </MenuItem>
          ))}
        </div>

        {settingsItem && (
          <div ref={settingsRef} className={clsx(styles.settingsWrapper)}>
            <div
              className={clsx(styles.settingsTrigger, settingsOpen && styles.settingsTriggerOpen)}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <span className={clsx(styles.sidebarIcon)}><settingsItem.icon /></span>
              <span className={clsx(styles.settingsLabel)}>{settingsItem.title}</span>
              <AiOutlineRight className={clsx(styles.chevron, settingsOpen && styles.chevronOpen)} />
            </div>

            {settingsOpen && (
              <div className={clsx(styles.flyout)}>
                <div className={clsx(styles.flyoutTail)} />
                <div className={clsx(styles.flyoutSectionLabel)}>Tài khoản</div>
                {settingsItem.subItems.filter(isVisible).map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={subItem.path}
                    className={clsx(styles.flyoutItem, subItem.danger && styles.flyoutItemDanger)}
                    onClick={() => setSettingsOpen(false)}
                  >
                    <subItem.icon className={clsx(styles.flyoutItemIcon)} />
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
