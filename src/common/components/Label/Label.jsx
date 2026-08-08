import clsx from 'clsx';
import styles from './Label.module.scss';

const Label = ({ className = "", children, style, required }) => {
    return <div className={clsx(styles.label, required && styles.required, className)} style={style}>{children}</div>;
  };
  
  export default Label;
  