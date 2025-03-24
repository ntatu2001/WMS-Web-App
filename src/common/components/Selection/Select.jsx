import clsx from 'clsx';
import styles from './Selection.module.scss';

const Select = ({ children, className = "", style, ...props}) => {
    return (
      <select
        className={clsx(styles.select, className)} style={style}
        {...props}
      >
        {children}
      </select>
    );
  };
  
  export default Select;
  