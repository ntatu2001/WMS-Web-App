import clsx from 'clsx';
import styles from './Section.module.scss';

const FormSection = ({ className = "", children }) => {
    return (
      <div className={clsx(styles.formSection, className)}>
        {children}
      </div>
    );
  };
  
  export default FormSection;
  