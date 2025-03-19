import styles from './ActionButton.module.scss';
import clsx from 'clsx';

const ActionButton = ({ children, onClick, className }) => {
    return (
      <button
        onClick={onClick}
        className={clsx(styles.actionButton, className)}
      >
        {children}
      </button>
    );
  };
  
  export default ActionButton;
  