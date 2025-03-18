import clsx from 'clsx';
import styles from './Selection.module.scss';

const SelectContainer = ({ children, className = "" }) => {
    return <div className={clsx(styles.selectContainer, className)}>{children}</div>;
  };
  
  export default SelectContainer;
  