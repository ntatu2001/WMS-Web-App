import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineSun, AiOutlineMoon, AiOutlineDesktop } from 'react-icons/ai';
import clsx from 'clsx';
import styles from './Appearance.module.scss';
import { setThemeMode } from '../../../../store/slices/themeSlice';

const OPTIONS = [
  {
    value: 'light',
    label: 'Sáng',
    description: 'Nền sáng, phù hợp môi trường nhiều ánh sáng.',
    icon: AiOutlineSun,
  },
  {
    value: 'dark',
    label: 'Tối',
    description: 'Nền tối, giảm chói mắt khi làm việc ban đêm.',
    icon: AiOutlineMoon,
  },
  {
    value: 'system',
    label: 'Theo hệ thống',
    description: 'Tự động theo thiết lập sáng/tối của hệ điều hành.',
    icon: AiOutlineDesktop,
  },
];

const Appearance = ({ onCancel }) => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Giao diện</div>
          {onCancel && (
            <button className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
              ×
            </button>
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.sectionTitle}>Chế độ hiển thị</p>
          <div className={styles.options} role="radiogroup" aria-label="Chế độ hiển thị">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={clsx(styles.optionCard, selected && styles.optionCardSelected)}
                  onClick={() => dispatch(setThemeMode(option.value))}
                >
                  <span className={styles.optionIcon}>
                    <Icon />
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    <span className={styles.optionDescription}>{option.description}</span>
                  </span>
                  <span className={clsx(styles.optionRadio, selected && styles.optionRadioOn)} />
                </button>
              );
            })}
          </div>
          <p className={styles.hint}>Thay đổi được áp dụng ngay và ghi nhớ cho lần đăng nhập sau.</p>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
