import styles from './ActionButton.module.scss';
import clsx from 'clsx';

const ActionButton = ({ children, onClick, className, style, variant, active, disabled }) => {
    return (
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={clsx(
          styles.actionButton,
          variant === 'secondary' && styles.secondary,
          active && styles.active,
          disabled && styles.disabled,
          className
        )}
        style = {style}
      >
        {children}
      </button>
    );
  };

  export default ActionButton;
