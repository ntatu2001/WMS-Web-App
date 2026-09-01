import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRouteForRoles } from '../../common/config/menuConfig.js';
import useTranslation from '../../common/hooks/useTranslation';

const Forbidden = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const roles = useSelector((state) => state.auth.roles);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--status-error)', marginBottom: '10px' }}>{t('forbidden.title')}</h1>
      <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        {t('forbidden.message')}
      </p>
      <button
        onClick={() => navigate(getDefaultRouteForRoles(roles))}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--control-solid-bg)',
          color: 'var(--control-solid-fg)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {t('forbidden.home')}
      </button>
    </div>
  );
};

export default Forbidden;
