import clsx from 'clsx';
import styles from './FormGroup.module.scss';

const FormGroup = ({ children, className = "" }) => {
    return <div className={clsx(styles.formGroup, className)}
    >
      {children}
      </div>;
  };
  
  export default FormGroup;
  