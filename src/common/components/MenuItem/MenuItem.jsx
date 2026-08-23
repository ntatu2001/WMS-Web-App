import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from 'clsx';
import styles from './MenuItem.module.scss';

const MenuItem = ({ to, children, collapsed, tooltip }) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [tooltipPos, setTooltipPos] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const active = location.pathname === to ||
                  (to !== '/' && location.pathname.startsWith(to));
    setIsActive(active);
  }, [location, to]);

  // Tooltip được render qua Portal thẳng vào document.body (thay vì nằm trong
  // .sidebarNavScroll) để tránh làm nhánh cha (overflow-y: auto) phải tính thêm
  // vùng cuộn ngang cho phần tooltip trồi ra ngoài Sidebar khi thu gọn.
  const handleMouseEnter = () => {
    if (!collapsed || !tooltip || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
  };
  const handleMouseLeave = () => setTooltipPos(null);

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles.itemWrapper)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={to}
        className={clsx(styles.link, isActive ? styles.link_active : styles.link_inactive, collapsed && styles.link_collapsed)}
      >
        {children}
      </Link>
      {collapsed && tooltip && tooltipPos && createPortal(
        <span
          className={clsx(styles.tooltip)}
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {tooltip}
        </span>,
        document.body
      )}
    </div>
  );
};

export default MenuItem;
