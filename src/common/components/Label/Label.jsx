import clsx from 'clsx';
import styles from './Label.module.scss';

const Label = ({ className = "", children }) => {
    return <div className={clsx(styles.label, className)}>{children}</div>;
  };
  
  export default Label;
  