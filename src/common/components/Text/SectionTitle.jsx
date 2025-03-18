import clsx from 'clsx';
import styles from './Text.module.scss';

const SectionTitle = ({ children, className = "" }) => {
    return (
      <h2 className={clsx(styles.sectionTitle, className)}>
        {children}
      </h2>
    );
  };
  
  export default SectionTitle;
  