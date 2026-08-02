import clsx from 'clsx';
import styles from './Section.module.scss';

const ListSection = ({ className = "", children, style, elevated}) => {
    return (
      <div className={clsx(styles.listSection, elevated && styles.elevated, className)} style = {style}>
        {children}
      </div>
    );
  };
  
  export default ListSection;
  