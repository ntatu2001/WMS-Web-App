import clsx from 'clsx';
import styles from './Section.module.scss';

const ListSection = ({ className = "", children }) => {
    return (
      <div className={clsx(styles.listSection, className)}>
        {children}
      </div>
    );
  };
  
  export default ListSection;
  