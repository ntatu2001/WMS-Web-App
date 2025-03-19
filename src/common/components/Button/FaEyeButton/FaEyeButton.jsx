import clsx from 'clsx';
import styles from './FaEyeButton.module.scss';

const FaEyeButton = ({ children, onClick, className}) => {
    return (
      <button
        onClick={onClick}
        className={clsx(styles.faEyeButton, className)}
      >
        {children}
      </button>
    );
  };
  export default FaEyeButton;