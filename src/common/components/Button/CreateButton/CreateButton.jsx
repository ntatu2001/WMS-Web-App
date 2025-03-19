import clsx from 'clsx';
import styles from './CreateButton.module.scss';
const CreateButton = ({ children, onClick, className}) => {
    return (
      <button
        onClick={onClick}
        className={clsx(styles.createButton, className)}
      >
        {children}
      </button>
    );
  };
  export default CreateButton;
  