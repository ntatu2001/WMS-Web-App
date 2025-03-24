import clsx from 'clsx';
import styles from './Selection.module.scss';

const SelectContainer = ({ children, className = "", style}) => {
    return <div className={clsx(styles.selectContainer, className)} style={style}>{children}</div>;
  };
  
  export default SelectContainer;
  