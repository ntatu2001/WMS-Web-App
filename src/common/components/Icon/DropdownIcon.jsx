import clsx from 'clsx';
import styles from './DropdownIcon.module.scss';

const DropdownIcon = ({ className = "", children }) => {
    return (
      <div
        className={clsx(styles.dropDownIcon, className)}
      >
        {children}
      </div>
    );
  };
  
  export default DropdownIcon;
  