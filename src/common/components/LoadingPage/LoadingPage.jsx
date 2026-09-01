import React from 'react';
import clsx from 'clsx';
import useTranslation from '../../hooks/useTranslation';
import styles from './LoadingPage.module.scss';
const LoadingPage = () => {
  const { t } = useTranslation();
  return (
    <div className={clsx(styles.div)} style={styles}>
      <div className={clsx(styles.loader)}></div>
      <div style={{ height: 30 }}></div>
      <h2>{t('common.loading')}</h2>
    </div>
  );
};

export default LoadingPage; 