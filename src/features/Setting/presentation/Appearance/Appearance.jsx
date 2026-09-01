import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlineSun, AiOutlineMoon, AiOutlineDesktop, AiOutlineGlobal } from 'react-icons/ai';
import clsx from 'clsx';
import styles from './Appearance.module.scss';
import { setThemeMode } from '../../../../store/slices/themeSlice';
import { setLanguage } from '../../../../store/slices/languageSlice';
import useTranslation from '../../../../common/hooks/useTranslation';

const THEME_OPTIONS = [
  { value: 'light', labelKey: 'setting.modeLight', descKey: 'setting.modeLightDesc', icon: AiOutlineSun },
  { value: 'dark', labelKey: 'setting.modeDark', descKey: 'setting.modeDarkDesc', icon: AiOutlineMoon },
  { value: 'system', labelKey: 'setting.modeSystem', descKey: 'setting.modeSystemDesc', icon: AiOutlineDesktop },
];

const LANGUAGE_OPTIONS = [
  { value: 'vi', labelKey: 'setting.langVi', descKey: 'setting.langViDesc', icon: AiOutlineGlobal },
  { value: 'en', labelKey: 'setting.langEn', descKey: 'setting.langEnDesc', icon: AiOutlineGlobal },
];

const OptionCard = ({ option, selected, onSelect, t }) => {
  const Icon = option.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={clsx(styles.optionCard, selected && styles.optionCardSelected)}
      onClick={onSelect}
    >
      <span className={styles.optionIcon}>
        <Icon />
      </span>
      <span className={styles.optionText}>
        <span className={styles.optionLabel}>{t(option.labelKey)}</span>
        <span className={styles.optionDescription}>{t(option.descKey)}</span>
      </span>
      <span className={clsx(styles.optionRadio, selected && styles.optionRadioOn)} />
    </button>
  );
};

const Appearance = ({ onCancel }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const mode = useSelector((state) => state.theme.mode);
  const lang = useSelector((state) => state.language.lang);

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>{t('setting.appearanceAndLanguage')}</div>
          {onCancel && (
            <button className={styles.closeButton} onClick={onCancel} aria-label={t('common.close')}>
              ×
            </button>
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.sectionTitle}>{t('setting.displayMode')}</p>
          <div className={styles.options} role="radiogroup" aria-label={t('setting.displayMode')}>
            {THEME_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={mode === option.value}
                onSelect={() => dispatch(setThemeMode(option.value))}
                t={t}
              />
            ))}
          </div>

          <p className={styles.sectionTitle} style={{ marginTop: 24 }}>
            {t('setting.language')}
          </p>
          <div className={styles.options} role="radiogroup" aria-label={t('setting.language')}>
            {LANGUAGE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={lang === option.value}
                onSelect={() => dispatch(setLanguage(option.value))}
                t={t}
              />
            ))}
          </div>

          <p className={styles.hint}>{t('setting.applyHint')}</p>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
