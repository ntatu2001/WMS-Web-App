import clsx from 'clsx';
import styles from './Section.module.scss';

const FormSection = ({ className = "", children, style, elevated }) => {
    return (
      <div className={clsx(styles.formSection, elevated && styles.elevated, className)} style={style}>
        {children}
      </div>
    );
  };
  
  export default FormSection;
  