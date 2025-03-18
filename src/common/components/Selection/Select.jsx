import clsx from 'clsx';
import styles from './Selection.module.scss';

const Select = ({ children, className = "", ...props }) => {
    return (
      <select
        className={clsx(styles.select, className)}
        {...props}
      >
        {children}
      </select>
    );
  };
  
  export default Select;
  