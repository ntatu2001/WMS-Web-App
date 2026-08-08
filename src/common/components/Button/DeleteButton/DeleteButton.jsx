import clsx from 'clsx';
import styles from './DeleteButton.module.scss';

const DeleteButton = ({ children, onClick, className, disabled }) => {
    return (
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={clsx(styles.deleteButton, disabled && styles.disabled, className)}
      >
        {children}
      </button>
    );
  };
  export default DeleteButton;
