import clsx from 'clsx';
import styles from './Tag.module.scss';

const Tag = ({ children, variant = 'neutral', className = "", style }) => {
  return (
    <span
      className={clsx(styles.tag, variant === 'accent' ? styles.accent : styles.neutral, className)}
      style={style}
    >
      {children}
    </span>
  );
};

export default Tag;
