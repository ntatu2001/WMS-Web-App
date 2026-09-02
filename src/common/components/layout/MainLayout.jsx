import React, { useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { AiOutlineMenu } from 'react-icons/ai';
import styles from './MainLayout.module.scss';
import { closeMobileNav, openMobileNav } from '../../../store/slices/uiSlice';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import useTranslation from '../../hooks/useTranslation';

const MainLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const isMobileNavOpen = useSelector((state) => state.ui.isMobileNavOpen);

  // Auto-close the mobile drawer whenever the route changes (covers menu-item
  // clicks and any other navigation, e.g. browser back/forward).
  useEffect(() => {
    dispatch(closeMobileNav());
  }, [location.pathname, dispatch]);

  return (
    <div className={clsx(styles.div)}>
      {isMobile && (
        <div className={clsx(styles.mobileTopBar)}>
          <button
            type="button"
            className={clsx(styles.mobileMenuButton)}
            onClick={() => dispatch(openMobileNav())}
            aria-label={t('menu.openMenu')}
          >
            <AiOutlineMenu />
          </button>
        </div>
      )}

      {isMobile && isMobileNavOpen && (
        <div
          className={clsx(styles.backdrop)}
          onClick={() => dispatch(closeMobileNav())}
          aria-hidden="true"
        />
      )}

      <Sidebar isMobile={isMobile} isMobileNavOpen={isMobileNavOpen} />

      <main className={clsx(styles.main)}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
