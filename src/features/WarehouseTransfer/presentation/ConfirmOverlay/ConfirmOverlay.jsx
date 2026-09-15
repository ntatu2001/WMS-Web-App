import React from 'react';
import clsx from 'clsx';
import ActionButton from '../../../../common/components/Button/ActionButton/ActionButton.jsx';
import useTranslation from '../../../../common/hooks/useTranslation';
import styles from './ConfirmOverlay.module.scss';

// Overlay xác nhận dùng chung cho Confirm Departure / Confirm Arrival / Cancel trong
// feature Warehouse Transfer. `wide` mở rộng card cho ConfirmArrivalPanel (có bảng bên trong).
const ConfirmOverlay = ({ title, onCancel, onConfirm, isProcessing, confirmLabel, wide, children }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={clsx(styles.card, wide && styles.cardWide)}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.body}>{children}</div>
        <div className={styles.actions}>
          <ActionButton
            variant="secondary"
            onClick={onCancel}
            disabled={isProcessing}
            style={{ width: 'auto', margin: 0, padding: '10px 18px', fontSize: '14px' }}
          >
            {t('common.cancel')}
          </ActionButton>
          <ActionButton
            onClick={onConfirm}
            disabled={isProcessing}
            style={{ width: 'auto', margin: 0, padding: '10px 18px', fontSize: '14px' }}
          >
            {isProcessing ? t('transfer.processing') : (confirmLabel || t('common.confirm'))}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOverlay;
